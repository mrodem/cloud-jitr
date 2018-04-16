#!/bin/bash

# Script that automates the steps for creating a device certificate, described on
# https://aws.amazon.com/blogs/iot/just-in-time-registration-of-device-certificates-on-aws-iot/

set -x -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CERTIFICATE_PATH=$SCRIPT_DIR/../cert
CLIENT_ID=12345678

# Create a device certificate
openssl genrsa -out $CERTIFICATE_PATH/deviceCert.key 2048
openssl req -new -subj "/CN=$CLIENT_ID" -key $CERTIFICATE_PATH/deviceCert.key -out $CERTIFICATE_PATH/deviceCert.csr
openssl x509 -req -in $CERTIFICATE_PATH/deviceCert.csr -CA $CERTIFICATE_PATH/sampleCACertificate.pem -CAkey $CERTIFICATE_PATH/sampleCACertificate.key -CAcreateserial -out $CERTIFICATE_PATH/deviceCert.crt -days 365 -sha256

# Combine the device certificate and CA certificate
cat $CERTIFICATE_PATH/deviceCert.crt $CERTIFICATE_PATH/sampleCACertificate.pem > $CERTIFICATE_PATH/deviceCertAndCACert.crt
