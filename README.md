# AWS IoT JITR auto-setup

Easy setup of AWS IoT Just-in-Time Registration using an AWS CloudFormation template and some simple scripts.

## Overview

Just-in-Time Registration allows devices to connect and authenticate with AWS IoT without any up-front registration. For this to work, the devices must provide a certificate signed by a CA that is registered in AWS IoT. When the device connects for the first time, AWS IoT will validate the certificate, set up a policy for the device, and add it to the Thing registry. See [this blog post](https://aws.amazon.com/blogs/iot/just-in-time-registration-of-device-certificates-on-aws-iot/) for more information on AWS IoT JITR.

This project automates the JITR setup by providing the following:
- A script for generating and registering a sample CA certificate: [register-ca-cert.sh](scripts/register-ca-cert.sh)
- A script for creating a sample device certificate: [create-device-cert.sh](scripts/create-device-cert.sh)
- A CloudFormation template that sets up the AWS IoT JITR stack: [cloud-jitr-setup.yaml](templates/cloud-jitr-setup.yaml)
- A Lambda function that parses the CN from the device certificate, attaches a policy, and registers the device in the Thing registry: [lambda/index.js](lambda/index.js)

When everything is set up, the [connect-device.js](scripts/connect-device.js) script can be run to test a device connection.

Installation and instructions are described below. The setup is currently done for the AWS region `us-east-1`. Setting up in a different region requires editing the scripts manually.

## Requirements

* [Node.js](https://nodejs.org/) (v6 or higher)
* [AWS CLI](https://aws.amazon.com/cli/)
* [openssl](https://www.openssl.org/)
* Bash
* An AWS account

## Installation

To install required Node.js dependencies, run:

    npm install

## Setting up JITR

### Configure AWS credentials

Before running any of the commands below, AWS credentials must be configured for your local user. If not already done, run `aws configure` to specify access key and secret key as descibed on https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html.

### 1. Create and register a sample CA certificate

A CA certificate must be registered with AWS IoT. This is the certificate that will be used to sign your device certificates. For production use, this would typically be a certificate that have been purchased from e.g. Verisign or Symantec.

To generate and register a sample CA certificate to use with AWS IoT, run:

    npm run register-ca-cert

This will generate the following files in the `cert` directory:
* privateKeyVerification.crt
* privateKeyVerification.csr
* privateKeyVerification.key
* sampleCaCertificate.key
* sampleCaCertificate.pem

### 2. Create a sample device certificate

Each device that should connect to AWS IoT must provide a device certificate that has been signed with the registered CA certificate.

To generate a sample device certificate for use with AWS IoT, run:

    npm run create-device-cert

This will generate the following files in the `cert` directory:
* deviceCertAndCACert.crt
* deviceCert.crt
* deviceCert.csr
* deviceCert.key

### 3. Create the AWS IoT JITR stack

The project includes a CloudFormation template for setting up a basic AWS IoT JITR stack. To create it, run:

    npm run create-stack

### 4. Connect a device to AWS IoT

The project includes a simple script that connects using the AWS IoT Device SDK:

    npm run connect-device

This will ask for the endpoint for AWS IoT, which can be found on [https://console.aws.amazon.com/iot/home?region=us-east-1#/settings](https://console.aws.amazon.com/iot/home?region=us-east-1#/settings). When connecting, the JITR process is initiated for the device in AWS IoT. It will be disconnected and attempt to reconnect for a few seconds. Once the device has been registered, the connection will succeed. When running the same command again, the device is already set up, and will immediately be connected.

The certificate, policy, and Thing that was created during JITR can be examined on https://console.aws.amazon.com/iot/.
