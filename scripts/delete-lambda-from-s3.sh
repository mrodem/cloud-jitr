#!/bin/bash

# Removes the Lambda function created by upload-lambda-to-s3.sh.

set -x -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
S3_BUCKET_NAME=$USER-aws-iot-jitr-lambda
REGION=us-east-1

if aws s3api head-bucket --bucket $S3_BUCKET_NAME --region $REGION; then
    aws s3api delete-bucket --bucket $S3_BUCKET_NAME --region $REGION
    echo "Removed S3 bucket $S3_BUCKET_NAME"
else
    echo "S3 bucket $S3_BUCKET_NAME does not exist. Not removing."
fi

