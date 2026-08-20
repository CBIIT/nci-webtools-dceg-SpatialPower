import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as appscaling from "aws-cdk-lib/aws-applicationautoscaling";
import { Construct } from "constructs";

export interface EcsAppStackProps extends cdk.StackProps {
  tier: string;
  appName: string;
  appNamespace: string;
  appService: string;
  appDomain: string;
  appPathPrefix: string;

  vpcId: string;
  subnetIds: string[];
  securityGroupIds: string[];
  clusterArn: string;
  listenerArn: string;
  appRoleArn: string;

  listenerRulePriority: number;
  healthCheckPath: string;
  gracePeriod: number;

  cpu: number;
  memory: number;
  desiredCount: number;
  containerPort: number;

  nonProdSchedule: boolean;
  scheduledMinCapacity: number;
  scheduledMaxCapacity: number;
}

export class EcsAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcsAppStackProps) {
    super(scope, id, props);

    const {
      tier,
      appName,
      appNamespace,
      appService,
      appDomain,
      appPathPrefix,
      vpcId,
      subnetIds,
      securityGroupIds,
      clusterArn,
      listenerArn,
      appRoleArn,
      listenerRulePriority,
      healthCheckPath,
      gracePeriod,
    } = props;

    // Stack-level tags
    cdk.Tags.of(this).add("EnvironmentTier", tier);
    cdk.Tags.of(this).add("ResourceName", `${tier}-${appName}`);
    cdk.Tags.of(this).add("ManagedBy", "cdk");
    cdk.Tags.of(this).add("CreatedBy", "cdk");
    cdk.Tags.of(this).add("Project", "dceg-analysistools");
    cdk.Tags.of(this).add("ApplicationName", appName);

    // Import existing shared resources
    const vpc = ec2.Vpc.fromLookup(this, "Vpc", { vpcId });

    const subnets = subnetIds.map((sid, i) =>
      ec2.Subnet.fromSubnetId(this, `Subnet${i}`, sid)
    );

    const securityGroups = securityGroupIds.map((sgId, i) =>
      ec2.SecurityGroup.fromSecurityGroupId(this, `SG${i}`, sgId)
    );

    const clusterName = cdk.Arn.split(
      clusterArn,
      cdk.ArnFormat.SLASH_RESOURCE_NAME
    ).resourceName!;
    const cluster = ecs.Cluster.fromClusterAttributes(this, "Cluster", {
      clusterName,
      clusterArn,
      vpc,
      securityGroups,
    });

    const executionRole = iam.Role.fromRoleArn(this, "ExecutionRole", appRoleArn);
    const taskRole = iam.Role.fromRoleArn(this, "TaskRole", appRoleArn);

    const listener = elbv2.ApplicationListener.fromApplicationListenerAttributes(
      this,
      "Listener",
      {
        listenerArn,
        securityGroup: securityGroups[0],
      }
    );

    // Async job queues (FIFO)
    const errorQueue = new sqs.Queue(this, "ErrorQueue", {
      queueName: `${tier}-${appName}-error.fifo`,
      fifo: true,
      contentBasedDeduplication: false,
      retentionPeriod: cdk.Duration.days(14),
      visibilityTimeout: cdk.Duration.seconds(900),
    });

    const workQueue = new sqs.Queue(this, "WorkQueue", {
      queueName: `${tier}-${appName}.fifo`,
      fifo: true,
      contentBasedDeduplication: false,
      retentionPeriod: cdk.Duration.days(4),
      visibilityTimeout: cdk.Duration.seconds(900),
    });

    workQueue.grantSendMessages(taskRole);
    workQueue.grantConsumeMessages(taskRole);
    errorQueue.grantSendMessages(taskRole);

    // CloudWatch log group
    const logGroup = new logs.LogGroup(this, "WebLogGroup", {
      logGroupName: `/${appNamespace}/${tier}/${appName}/web`,
      retention: logs.RetentionDays.SIX_MONTHS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Placeholder task definition; real one registered by deploy-app workflow
    const taskDef = new ecs.FargateTaskDefinition(this, "WebTaskDef", {
      family: `${tier}-${appName}-${appService}`,
      cpu: props.cpu,
      memoryLimitMiB: props.memory,
      executionRole,
      taskRole,
    });

    taskDef.addContainer("WebContainer", {
      containerName: "frontend",
      image: ecs.ContainerImage.fromRegistry("nginx:alpine"),
      essential: true,
      portMappings: [
        {
          containerPort: props.containerPort,
          hostPort: props.containerPort,
          protocol: ecs.Protocol.TCP,
        },
      ],
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: "frontend",
      }),
    });

    // Target group
    const tg = new elbv2.ApplicationTargetGroup(this, "WebTG", {
      targetGroupName: `${tier}-${appName}-${appService}`,
      port: props.containerPort,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      vpc,
      healthCheck: {
        enabled: true,
        path: healthCheckPath,
        port: String(props.containerPort),
        // healthyHttpCodes omitted — defaults to "200" so a broken SPA returning
        // 4xx is treated as unhealthy and pulled from rotation.
      },
    });

    // ALB listener rule: route the app's host + path prefix to this service.
    listener.addTargetGroups("WebListenerRule", {
      targetGroups: [tg],
      conditions: [
        elbv2.ListenerCondition.hostHeaders([appDomain]),
        elbv2.ListenerCondition.pathPatterns([
          appPathPrefix,
          `${appPathPrefix}/*`,
        ]),
      ],
      priority: listenerRulePriority,
    });

    // Fargate service
    const service = new ecs.FargateService(this, "WebService", {
      serviceName: `${tier}-${appName}-${appService}`,
      cluster,
      taskDefinition: taskDef,
      // Create the placeholder service with 0 tasks. The nginx:alpine placeholder
      // returns 404 at the health-check path and the matcher is strict 200, so a
      // running placeholder would trip the deployment circuit breaker on first
      // CREATE. deploy-app scales the service to the real count (its
      // `update-service --desired-count 1`) with the real image, which is healthy.
      // NOTE: infra updates reset the count to 0 — always run deploy-app after
      // deploy-infrastructure (the documented infra -> app order).
      desiredCount: 0,
      securityGroups,
      vpcSubnets: { subnets },
      assignPublicIp: false,
      enableECSManagedTags: true,
      enableExecuteCommand: true,
      circuitBreaker: { rollback: true },
      healthCheckGracePeriod: cdk.Duration.seconds(gracePeriod),
      propagateTags: ecs.PropagatedTagSource.TASK_DEFINITION,
    });

    service.attachToApplicationTargetGroup(tg);

    // Pin the service to the task-definition family so CDK doesn't revert the
    // revisions deploy-app registers. (DesiredCount stays at the template's 0
    // here; deploy-app sets the running count via update-service.)
    const cfnService = service.node.defaultChild as ecs.CfnService;
    cfnService.addPropertyOverride(
      "TaskDefinition",
      `${tier}-${appName}-${appService}`
    );

    // Scheduled auto-scaling (non-prod: scale to 0 nights/weekends)
    if (props.nonProdSchedule) {
      const scalable = service.autoScaleTaskCount({
        minCapacity: 0,
        maxCapacity: props.scheduledMaxCapacity,
      });

      scalable.scaleOnSchedule("ScaleOut", {
        schedule: appscaling.Schedule.cron({
          hour: "7",
          minute: "0",
          weekDay: "MON-FRI",
        }),
        minCapacity: props.scheduledMinCapacity,
        maxCapacity: props.scheduledMaxCapacity,
        timeZone: cdk.TimeZone.AMERICA_NEW_YORK,
      });

      scalable.scaleOnSchedule("ScaleIn", {
        schedule: appscaling.Schedule.cron({
          hour: "19",
          minute: "0",
          weekDay: "MON-FRI",
        }),
        minCapacity: 0,
        maxCapacity: 0,
        timeZone: cdk.TimeZone.AMERICA_NEW_YORK,
      });
    }

    // SSM parameters for deploy-app workflow
    new ssm.StringParameter(this, "SsmEcsCluster", {
      parameterName: `/${appNamespace}/${tier}/${appName}/ecs_cluster`,
      stringValue: clusterName,
    });

    new ssm.StringParameter(this, "SsmEcsWebTask", {
      parameterName: `/${appNamespace}/${tier}/${appName}/ecs_web_task`,
      stringValue: `${tier}-${appName}-${appService}`,
    });

    new ssm.StringParameter(this, "SsmEcsWebService", {
      parameterName: `/${appNamespace}/${tier}/${appName}/ecs_web_service`,
      stringValue: `${tier}-${appName}-${appService}`,
    });

    new ssm.StringParameter(this, "SsmRoleArn", {
      parameterName: `/${appNamespace}/${tier}/${appName}/role_arn`,
      stringValue: appRoleArn,
    });

    new ssm.StringParameter(this, "SsmQueueName", {
      parameterName: `/${appNamespace}/${tier}/${appName}/queue_name`,
      stringValue: workQueue.queueName,
    });

    new ssm.StringParameter(this, "SsmQueueErrorUrl", {
      parameterName: `/${appNamespace}/${tier}/${appName}/queue_error_url`,
      stringValue: errorQueue.queueUrl,
    });

    // Stack outputs
    new cdk.CfnOutput(this, "WebServiceName", {
      value: service.serviceName,
      description: "ECS Service Name",
    });

    new cdk.CfnOutput(this, "WebTaskDefArn", {
      value: taskDef.taskDefinitionArn,
      description: "Task Definition ARN",
    });

    new cdk.CfnOutput(this, "TargetGroupArn", {
      value: tg.targetGroupArn,
      description: "Target Group ARN",
    });

    new cdk.CfnOutput(this, "WorkQueueUrl", {
      value: workQueue.queueUrl,
      description: "SQS work queue URL",
    });

    new cdk.CfnOutput(this, "ErrorQueueUrl", {
      value: errorQueue.queueUrl,
      description: "SQS error queue URL",
    });
  }
}
