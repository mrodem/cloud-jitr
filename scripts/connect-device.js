const path = require('path');
const awsIot = require('aws-iot-device-sdk');
const inquirer = require('inquirer');

const certDir = path.resolve(__dirname, '../cert');

inquirer.prompt([{
    type: 'input',
    name: 'host',
    message: 'Enter the AWS IoT endpoint to connect to (<id>.iot.<region>.amazonaws.com):',
}]).then(({ host }) => {
    const device = awsIot.device({
        keyPath: `${certDir}/deviceCert.key`,
        certPath: `${certDir}/deviceCertAndCACert.crt`,
        caPath: `${certDir}/aws-iot-root.cert`,
        clientId: '12345678',
        host,
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
});
