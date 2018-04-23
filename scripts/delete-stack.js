const cfn = require('cfn');

cfn.delete({
    name: 'aws-iot-jitr',
    awsConfig: {
        region: 'us-east-1'
    }
});
