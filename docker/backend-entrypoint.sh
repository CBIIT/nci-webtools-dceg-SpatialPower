#!/bin/sh
# Backend/queue container entrypoint for SpatialPower.
#
# Renders server/config.json from environment variables, then execs the given
# command. The same image runs both the backend (CMD: npm start -> node app.js)
# and the queue worker (command override: node queue-worker.js); both read
# ./config.json via require(), so this entrypoint materializes it once.
#
# Two topologies share this image:
#   1. Serverless / Fargate: the task definition supplies these env vars and we
#      render config.json here (no host to bind-mount from).
#   2. Local dev / EC2: if config.json is already present (e.g. bind-mounted),
#      we leave it untouched so existing local flows keep working.
#
# AWS credentials are intentionally left blank: the ECS task role provides them
# automatically to the aws-sdk via the container credential endpoint.
set -e

CONFIG_PATH=/server/config.json

if [ -f "$CONFIG_PATH" ]; then
  echo "Using existing $CONFIG_PATH (bind-mounted); skipping env render."
else
  : "${SERVER_PORT:=8000}"
  : "${CLIENT_FOLDER:=../client/build}"
  : "${LOGS_FOLDER:=/server/logs}"
  : "${LOG_LEVEL:=info}"
  : "${RESULTS_FOLDER:=/server/results}"
  : "${AWS_REGION:=us-east-1}"
  : "${QUEUE_NAME:=}"
  : "${QUEUE_ERROR_URL:=}"
  : "${QUEUE_VISIBILITY_TIMEOUT:=60}"
  : "${QUEUE_POLL_INTERVAL:=60}"
  : "${EMAIL_ADMIN:=}"
  : "${EMAIL_SENDER:=}"
  : "${EMAIL_BASE_URL:=}"
  : "${EMAIL_SMTP_HOST:=}"
  : "${EMAIL_SMTP_PORT:=587}"
  : "${S3_BUCKET:=}"
  : "${S3_INPUT_PREFIX:=}"
  : "${S3_OUTPUT_PREFIX:=}"

  # Ensure runtime directories exist (task-ephemeral storage).
  mkdir -p "$LOGS_FOLDER" "$RESULTS_FOLDER"

  cat > "$CONFIG_PATH" <<EOF
{
  "server": {
    "port": ${SERVER_PORT},
    "static": "${CLIENT_FOLDER}"
  },
  "logs": {
    "folder": "${LOGS_FOLDER}",
    "level": "${LOG_LEVEL}"
  },
  "results": {
    "folder": "${RESULTS_FOLDER}"
  },
  "aws": {
    "region": "${AWS_REGION}",
    "accessKeyId": "",
    "secretAccessKey": ""
  },
  "queue": {
    "name": "${QUEUE_NAME}",
    "errorUrl": "${QUEUE_ERROR_URL}",
    "visibilityTimeout": ${QUEUE_VISIBILITY_TIMEOUT},
    "pollInterval": ${QUEUE_POLL_INTERVAL}
  },
  "email": {
    "admin": "${EMAIL_ADMIN}",
    "sender": "${EMAIL_SENDER}",
    "baseUrl": "${EMAIL_BASE_URL}",
    "smtp": {
      "host": "${EMAIL_SMTP_HOST}",
      "port": ${EMAIL_SMTP_PORT}
    }
  },
  "s3": {
    "bucket": "${S3_BUCKET}",
    "inputKeyPrefix": "${S3_INPUT_PREFIX}",
    "outputKeyPrefix": "${S3_OUTPUT_PREFIX}"
  }
}
EOF

  echo "Rendered $CONFIG_PATH from environment:"
  cat "$CONFIG_PATH"
fi

exec "$@"
