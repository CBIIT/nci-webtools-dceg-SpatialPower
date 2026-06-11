#!/usr/bin/env python3
"""CDK app entry point for the SpatialPower ECR stack (Python).

Equivalent to infrastructure/bin/ecr.ts. Deploy with:
    cdk deploy --app "python3 app_ecr.py"
"""
import os
import sys

import aws_cdk as cdk

from stacks.ecr_stack import EcrStack

TIER = os.environ.get("TIER")
AWS_ACCOUNT_ID = os.environ.get("AWS_ACCOUNT_ID")

if not TIER:
    print("Error: TIER environment variable is not defined", file=sys.stderr)
    sys.exit(1)

if not AWS_ACCOUNT_ID:
    print("Error: AWS_ACCOUNT_ID environment variable is not defined", file=sys.stderr)
    sys.exit(1)

region = os.environ.get("AWS_REGION", "us-east-1")

app = cdk.App()

EcrStack(
    app,
    f"SpatialPowerEcr-{TIER}",
    env=cdk.Environment(account=AWS_ACCOUNT_ID, region=region),
    stack_name=f"{TIER}-spatial-power-ecr",
    description="ECR repository for SpatialPower",
    tier=TIER,
    app_name=os.environ.get("APP_NAME", "spatial-power"),
    ecr_repo_name=os.environ.get("ECR_REPO_NAME", "spatial-power"),
    ecr_count_number=int(os.environ.get("ECR_COUNT_NUMBER", "10")),
)

app.synth()
