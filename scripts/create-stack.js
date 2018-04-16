const cfn = require('cfn');

cfn({
  name: 'aws-iot-jitr',
  capabilities: ['CAPABILITY_NAMED_IAM'],
  awsConfig: {
    region: 'us-east-1'
  },
}, 'cloud-jitr-setup.yaml');
