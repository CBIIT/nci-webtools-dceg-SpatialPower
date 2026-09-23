#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { EcrStack } from "../lib/ecr-stack";

const TIER = process.env.TIER;
const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;

if (!TIER) {
  console.error("Error: TIER environment variable is not defined");
  process.exit(1);
}

if (!AWS_ACCOUNT_ID) {
  console.error("Error: AWS_ACCOUNT_ID environment variable is not defined");
  process.exit(1);
}

const app = new cdk.App();
const region = process.env.AWS_REGION || "us-east-1";

new EcrStack(app, `SpatialPowerEcr-${TIER}`, {
  env: { account: AWS_ACCOUNT_ID, region },
  stackName: `${TIER}-spatial-power-ecr`,
  description: "ECR repository for SpatialPower",

  tier: TIER,
  appName: process.env.APP_NAME || "spatial-power",
  ecrRepoName: process.env.ECR_REPO_NAME || "spatial-power",
  ecrCountNumber: Number(process.env.ECR_COUNT_NUMBER || "10"),
});

app.synth();
