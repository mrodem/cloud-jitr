const path = require('path');
const awsIot = require('aws-iot-device-sdk');

const certDir = path.resolve(__dirname, '../cert');

const device = awsIot.device({
    keyPath: `${certDir}/deviceCert.key`,
    certPath: `${certDir}/deviceCert.crt`,
    caPath: `${certDir}/aws-iot-root.cert`,
    clientId: 12345678,
    host: 'a31tdzaj9dwy1x.iot.us-east-1.amazonaws.com'
});
