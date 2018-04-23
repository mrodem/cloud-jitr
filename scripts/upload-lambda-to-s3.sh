#!/bin/bash

# Uploads the Lambda function given in the CloudFormation template to
# an S3 bucket, and creates a new template that has replaced the Lambda
# file with a reference to the new bucket.
#
# https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-cli-package.html

set -x -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TEMPLATES_DIR=$SCRIPT_DIR/../templates
S3_BUCKET_NAME=aws-iot-jitr
REGION=us-east-1

if aws s3api head-bucket --bucket $S3_BUCKET_NAME --region $REGION; then
    echo "S3 bucket '$S3_BUCKET_NAME' already exists. Not creating."
else
    aws s3api create-bucket --bucket $S3_BUCKET_NAME --region $REGION
fi

aws cloudformation package \
    --template $TEMPLATES_DIR/cloud-jitr-setup.yaml \
    --s3-bucket $S3_BUCKET_NAME \
    --output-template-file $TEMPLATES_DIR/cloud-jitr-setup-with-s3-bucket.yaml
