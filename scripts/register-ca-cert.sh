#!/bin/bash

# Automates the steps for creating and registering a sample CA certificate, as described on
# https://aws.amazon.com/blogs/iot/just-in-time-registration-of-device-certificates-on-aws-iot/

set -x -e

# Paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CERTIFICATE_PATH=$SCRIPT_DIR/../cert

# Region
REGION="us-east-1"

# Create a sample CA certificate
openssl genrsa -out $CERTIFICATE_PATH/sampleCACertificate.key 2048
openssl req -x509 -new -subj "/CN=Sample CA" -nodes -key $CERTIFICATE_PATH/sampleCACertificate.key -sha256 -days 365 -out $CERTIFICATE_PATH/sampleCACertificate.pem

# Get the registration code bound to the current AWS account
REGISTRATION_CODE=$(aws iot get-registration-code --region $REGION --output text)

# Create a CSR
openssl genrsa -out $CERTIFICATE_PATH/privateKeyVerification.key 2048
openssl req -new -subj "/CN=$REGISTRATION_CODE" -key $CERTIFICATE_PATH/privateKeyVerification.key -out $CERTIFICATE_PATH/privateKeyVerification.csr

# Use the sample CA certificate and the CSR to create a verification certificate
openssl x509 -req -in $CERTIFICATE_PATH/privateKeyVerification.csr -CA $CERTIFICATE_PATH/sampleCACertificate.pem -CAkey $CERTIFICATE_PATH/sampleCACertificate.key -CAcreateserial -out $CERTIFICATE_PATH/privateKeyVerification.crt -days 365 -sha256

# Use the verification certificate to register the CA certificate
CERTIFICATE_ID=$(aws iot register-ca-certificate --region $REGION --ca-certificate file://$CERTIFICATE_PATH/sampleCACertificate.pem --verification-certificate file://$CERTIFICATE_PATH/privateKeyVerification.crt --query certificateId | sed 's/"//g')

# Activate certificate
aws iot update-ca-certificate --region $REGION --certificate-id $CERTIFICATE_ID --new-status ACTIVE

# Enable auto-registration for the certificate
aws iot update-ca-certificate --region $REGION --certificate-id $CERTIFICATE_ID --new-auto-registration-status ENABLE
