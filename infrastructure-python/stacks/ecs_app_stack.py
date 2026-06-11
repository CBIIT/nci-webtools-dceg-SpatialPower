"""ECS Fargate application stack for SpatialPower (Python CDK).

A 1:1 port of infrastructure/lib/ecs-app-stack.ts. It imports the shared
VPC / subnets / security groups / cluster / ALB listener / IAM role, provisions
two FIFO SQS queues (work + error) for the async sparrpowR jobs, and runs the
app as a Fargate service behind the shared ALB. The real task definition
(frontend + backend + queue + firelens) is rendered and registered by the
deploy-app GitHub workflow from .github/aws/web.yml; the container defined here
is only a placeholder so the service can be created/updated by CDK.
"""
from aws_cdk import (
    Stack,
    Tags,
    Duration,
    RemovalPolicy,
    TimeZone,
    CfnOutput,
    Arn,
    ArnFormat,
    Environment,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_iam as iam,
    aws_logs as logs,
    aws_sqs as sqs,
    aws_elasticloadbalancingv2 as elbv2,
    aws_ssm as ssm,
    aws_applicationautoscaling as appscaling,
)
from constructs import Construct


class EcsAppStack(Stack):
    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        *,
        env: Environment,
        stack_name: str,
        description: str,
        tier: str,
        app_name: str,
        app_namespace: str,
        app_service: str,
        app_domain: str,
        app_path_prefix: str,
        vpc_id: str,
        subnet_ids: list[str],
        security_group_ids: list[str],
        cluster_arn: str,
        listener_arn: str,
        app_role_arn: str,
        listener_rule_priority: int,
        health_check_path: str,
        grace_period: int,
        cpu: int,
        memory: int,
        desired_count: int,
        container_port: int,
        non_prod_schedule: bool,
        scheduled_min_capacity: int,
        scheduled_max_capacity: int,
    ) -> None:
        super().__init__(
            scope,
            construct_id,
            env=env,
            stack_name=stack_name,
            description=description,
        )

        # Stack-level tags
        Tags.of(self).add("EnvironmentTier", tier)
        Tags.of(self).add("ResourceName", f"{tier}-{app_name}")
        Tags.of(self).add("ManagedBy", "cdk")
        Tags.of(self).add("CreatedBy", "cdk")
        Tags.of(self).add("Project", "dceg-analysistools")
        Tags.of(self).add("ApplicationName", app_name)

        # Import existing shared resources
        vpc = ec2.Vpc.from_lookup(self, "Vpc", vpc_id=vpc_id)

        subnets = [
            ec2.Subnet.from_subnet_id(self, f"Subnet{i}", sid)
            for i, sid in enumerate(subnet_ids)
        ]

        security_groups = [
            ec2.SecurityGroup.from_security_group_id(self, f"SG{i}", sg_id)
            for i, sg_id in enumerate(security_group_ids)
        ]

        cluster_name = Arn.split(
            cluster_arn, ArnFormat.SLASH_RESOURCE_NAME
        ).resource_name
        assert cluster_name is not None
        cluster = ecs.Cluster.from_cluster_attributes(
            self,
            "Cluster",
            cluster_name=cluster_name,
            cluster_arn=cluster_arn,
            vpc=vpc,
            security_groups=security_groups,
        )

        execution_role = iam.Role.from_role_arn(self, "ExecutionRole", app_role_arn)
        task_role = iam.Role.from_role_arn(self, "TaskRole", app_role_arn)

        listener = elbv2.ApplicationListener.from_application_listener_attributes(
            self,
            "Listener",
            listener_arn=listener_arn,
            security_group=security_groups[0],
        )

        # ---------------------------------------------------------------------
        # Async job queues (SQS).
        #
        # SpatialPower submits long-running sparrpowR jobs to a work queue; the
        # queue-worker container polls it, runs the R computation, and writes
        # results to S3. Failed jobs are forwarded to a separate error queue.
        # Both are FIFO queues because the app supplies MessageGroupId /
        # MessageDeduplicationId on every send (see server/app.js,
        # queue-worker.js).
        # ---------------------------------------------------------------------
        error_queue = sqs.Queue(
            self,
            "ErrorQueue",
            queue_name=f"{tier}-{app_name}-error.fifo",
            fifo=True,
            content_based_deduplication=False,
            retention_period=Duration.days(14),
            visibility_timeout=Duration.seconds(900),
        )

        work_queue = sqs.Queue(
            self,
            "WorkQueue",
            queue_name=f"{tier}-{app_name}.fifo",
            fifo=True,
            content_based_deduplication=False,
            retention_period=Duration.days(4),
            visibility_timeout=Duration.seconds(900),
        )

        # Grant the shared task role access to the queues. APP_ROLE_ARN is the
        # shared analysistools task role, imported above with from_role_arn
        # (mutable by default), so CDK attaches scoped inline policies for THESE
        # queues only -- the same mechanism that already adds the per-app
        # CloudWatch log-group grants to that role. The backend sends to the
        # work queue; the worker consumes the work queue and forwards failures
        # to the error queue.
        work_queue.grant_send_messages(task_role)
        work_queue.grant_consume_messages(task_role)
        error_queue.grant_send_messages(task_role)

        # CloudWatch log group
        log_group = logs.LogGroup(
            self,
            "WebLogGroup",
            log_group_name=f"/{app_namespace}/{tier}/{app_name}/web",
            retention=logs.RetentionDays.SIX_MONTHS,
            removal_policy=RemovalPolicy.DESTROY,
        )

        # ---------------------------------------------------------------------
        # Placeholder task definition.
        #
        # As in the analysistools-portal reference stack, the real task definition
        # (frontend + backend + queue + firelens) is rendered and registered by
        # the deploy-app GitHub workflow from .github/aws/web.yml. This
        # placeholder only exists so the service can be created/updated by CDK;
        # the CfnService override below pins the service to the task-definition
        # *family* so CDK never reverts the workflow-registered revision.
        # ---------------------------------------------------------------------
        task_def = ecs.FargateTaskDefinition(
            self,
            "WebTaskDef",
            family=f"{tier}-{app_name}-{app_service}",
            cpu=cpu,
            memory_limit_mib=memory,
            execution_role=execution_role,
            task_role=task_role,
        )

        task_def.add_container(
            "WebContainer",
            container_name="frontend",
            image=ecs.ContainerImage.from_registry("nginx:alpine"),
            essential=True,
            port_mappings=[
                ecs.PortMapping(
                    container_port=container_port,
                    host_port=container_port,
                    protocol=ecs.Protocol.TCP,
                )
            ],
            logging=ecs.LogDrivers.aws_logs(
                log_group=log_group,
                stream_prefix="frontend",
            ),
        )

        # Target group
        tg = elbv2.ApplicationTargetGroup(
            self,
            "WebTG",
            target_group_name=f"{tier}-{app_name}-{app_service}",
            port=container_port,
            protocol=elbv2.ApplicationProtocol.HTTP,
            target_type=elbv2.TargetType.IP,
            vpc=vpc,
            health_check=elbv2.HealthCheck(
                enabled=True,
                path=health_check_path,
                port=str(container_port),
                healthy_http_codes="200-499",
            ),
        )

        # ALB listener rule: route the app's host + path prefix to this service.
        listener.add_target_groups(
            "WebListenerRule",
            target_groups=[tg],
            conditions=[
                elbv2.ListenerCondition.host_headers([app_domain]),
                elbv2.ListenerCondition.path_patterns(
                    [app_path_prefix, f"{app_path_prefix}/*"]
                ),
            ],
            priority=listener_rule_priority,
        )

        # Fargate service
        service = ecs.FargateService(
            self,
            "WebService",
            service_name=f"{tier}-{app_name}-{app_service}",
            cluster=cluster,
            task_definition=task_def,
            desired_count=desired_count,
            security_groups=security_groups,
            vpc_subnets=ec2.SubnetSelection(subnets=subnets),
            assign_public_ip=False,
            enable_ecs_managed_tags=True,
            enable_execute_command=True,
            circuit_breaker=ecs.DeploymentCircuitBreaker(rollback=True),
            health_check_grace_period=Duration.seconds(grace_period),
            propagate_tags=ecs.PropagatedTagSource.TASK_DEFINITION,
        )

        service.attach_to_application_target_group(tg)

        # Prevent CDK from reverting task definitions registered by deploy-app workflow
        cfn_service = service.node.default_child
        cfn_service.add_property_override(
            "TaskDefinition", f"{tier}-{app_name}-{app_service}"
        )
        cfn_service.add_property_deletion_override("DesiredCount")

        # Scheduled auto-scaling (non-prod: scale to 0 nights/weekends)
        if non_prod_schedule:
            scalable = service.auto_scale_task_count(
                min_capacity=0,
                max_capacity=scheduled_max_capacity,
            )

            scalable.scale_on_schedule(
                "ScaleOut",
                schedule=appscaling.Schedule.cron(
                    hour="7", minute="0", week_day="MON-FRI"
                ),
                min_capacity=scheduled_min_capacity,
                max_capacity=scheduled_max_capacity,
                time_zone=TimeZone.AMERICA_NEW_YORK,
            )

            scalable.scale_on_schedule(
                "ScaleIn",
                schedule=appscaling.Schedule.cron(
                    hour="19", minute="0", week_day="MON-FRI"
                ),
                min_capacity=0,
                max_capacity=0,
                time_zone=TimeZone.AMERICA_NEW_YORK,
            )

        # SSM parameters for deploy-app workflow
        ssm.StringParameter(
            self,
            "SsmEcsCluster",
            parameter_name=f"/{app_namespace}/{tier}/{app_name}/ecs_cluster",
            string_value=cluster_name,
        )

        ssm.StringParameter(
            self,
            "SsmEcsWebTask",
            parameter_name=f"/{app_namespace}/{tier}/{app_name}/ecs_web_task",
            string_value=f"{tier}-{app_name}-{app_service}",
        )

        ssm.StringParameter(
            self,
            "SsmEcsWebService",
            parameter_name=f"/{app_namespace}/{tier}/{app_name}/ecs_web_service",
            string_value=f"{tier}-{app_name}-{app_service}",
        )

        ssm.StringParameter(
            self,
            "SsmRoleArn",
            parameter_name=f"/{app_namespace}/{tier}/{app_name}/role_arn",
            string_value=app_role_arn,
        )

        ssm.StringParameter(
            self,
            "SsmQueueName",
            parameter_name=f"/{app_namespace}/{tier}/{app_name}/queue_name",
            string_value=work_queue.queue_name,
        )

        ssm.StringParameter(
            self,
            "SsmQueueUrl",
            parameter_name=f"/{app_namespace}/{tier}/{app_name}/queue_url",
            string_value=work_queue.queue_url,
        )

        ssm.StringParameter(
            self,
            "SsmQueueErrorUrl",
            parameter_name=f"/{app_namespace}/{tier}/{app_name}/queue_error_url",
            string_value=error_queue.queue_url,
        )

        # Stack outputs
        CfnOutput(
            self,
            "WebServiceName",
            value=service.service_name,
            description="ECS Service Name",
        )

        CfnOutput(
            self,
            "WebTaskDefArn",
            value=task_def.task_definition_arn,
            description="Task Definition ARN",
        )

        CfnOutput(
            self,
            "TargetGroupArn",
            value=tg.target_group_arn,
            description="Target Group ARN",
        )

        CfnOutput(
            self,
            "WorkQueueUrl",
            value=work_queue.queue_url,
            description="SQS work queue URL",
        )

        CfnOutput(
            self,
            "ErrorQueueUrl",
            value=error_queue.queue_url,
            description="SQS error queue URL",
        )
