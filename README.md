# AWS IoT JITR auto-setup

AWS CloudFormation template and scripts for auto-setup of Just In Time Registration (JITR) in AWS IoT. See [this blog post](https://aws.amazon.com/blogs/iot/just-in-time-registration-of-device-certificates-on-aws-iot/) for an in-depth description of JITR and commands for manual setup.

## Requirements

* [Node.js](https://nodejs.org/) (v6 or higher)
* [AWS CLI](https://aws.amazon.com/cli/)

## Installation

To install required dependencies, run:

    npm install

## Setting up JITR

### Configure AWS credentials

Before running any of the commands below, AWS credentials must be configured for your local user. Run `aws configure` to specify access key and secret key as descibed on https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html.

### 1. Register a sample CA certificate

A CA certificate must be registered with AWS IoT. This is the certificate that will be used to sign your device certificates. For production use, this would typically be a certificate that have been purchased from e.g. Verisign or Symantec.

To generate and register a sample CA certificate to use with AWS IoT, run:

    npm run register-ca-cert

This will generate the following files in the `cert` directory:
* privateKeyVerification.crt
* privateKeyVerification.csr
* privateKeyVerification.key
* sampleCaCertificate.key
* sampleCaCertificate.pem

### 2. Register a sample device certificate

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

When connection, the JITR process is initiated for the device in AWS IoT. It will be disconnected and attempt to reconnect for a few seconds. Once the device has been registered, the connection will succeed. When running the same command again, the device is already set up, and will immediately be connected.

The certificate, policy, and Thing that was created during JITR can be examined on https://console.aws.amazon.com/iot/.
