const path = require('path');
const awsIot = require('aws-iot-device-sdk');

const certDir = path.resolve(__dirname, '../cert');

const device = awsIot.device({
    keyPath: `${certDir}/deviceCert.key`,
    certPath: `${certDir}/deviceCertAndCACert.crt`,
    caPath: `${certDir}/aws-iot-root.cert`,
    clientId: '12345678',
    host: 'a31tdzaj9dwy1x.iot.us-east-1.amazonaws.com',
});

device.on('connect', () => {
    console.log('connected');
});

device.on('close', () => {
    console.log('close');
});

device.on('reconnect', () => {
    console.log('reconnect');
});

device.on('offline', () => {
    console.log('offline');
});

device.on('error', function(error) {
    console.log('error', error);
});

device.on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
});
