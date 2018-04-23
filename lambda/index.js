const AWS = require('aws-sdk');
const { spawn } = require('child_process');

function createPolicy(iot, options) {
    console.log(`Creating policy: ${JSON.stringify(options)}`);
    return new Promise((resolve, reject) => {
        iot.createPolicy(options, (err, data) => {
            if (err && (!err.code || err.code !== 'ResourceAlreadyExistsException')) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function attachPrincipalPolicy(iot, options) {
    console.log(`Attaching principal policy: ${JSON.stringify(options)}`);
    return new Promise((resolve, reject) => {
        iot.attachPrincipalPolicy(options, (err, data) => {
            if (err && (!err.code || err.code !== 'ResourceAlreadyExistsException')) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function attachThingPrincipal(iot, options) {
    console.log(`Attaching thing principal: ${JSON.stringify(options)}`);
    return new Promise((resolve, reject) => {
        iot.attachThingPrincipal(options, (err, data) => {
            if (err && (!err.code || err.code !== 'ResourceAlreadyExistsException')) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function updateCertificate(iot, options) {
    console.log(`Updating certificate: ${JSON.stringify(options)}`);
    return new Promise((resolve, reject) => {
        iot.updateCertificate(options, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function createThing(iot, options) {
    console.log(`Creating thing: ${JSON.stringify(options)}`);
    return new Promise((resolve, reject) => {
        iot.createThing(options, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function getCertificateSubject(certificatePem) {
    return new Promise((resolve, reject) => {
        const openssl = spawn('openssl', ['x509', '-noout', '-subject']);
        let result = '';
        openssl.stdout.on('data', data => {
            result += data.toString();
        });
        openssl.stdin.write(certificatePem);
        openssl.stdin.end();
        openssl.on('close', code => {
            if (code === 0) {
                resolve(result);
            } else {
                reject(result);
            }
        });
    });
}

function getCertificateCommonName(certificatePem) {
    return getCertificateSubject(certificatePem)
        .then(subject => {
            const regex = /^subject= \/CN=(.*)/;
            const match = regex.exec(subject);
            if (match && match.length > 1) {
                return match[1];
            }
            throw new Error(`Unable to get CN from subject: ${subject}`);
        });
}

function describeCertificate(iot, params) {
    console.log(`Calling describeCertificate with: ${JSON.stringify(params)}`);
    return new Promise((resolve, reject) => {
        iot.describeCertificate(params, (err, data) => {
            if (err) {
                reject(err);
            } else if (!data.certificateDescription) {
                reject(new Error(`Got no certificate description for: ${params}`));
            } else {
                resolve(data.certificateDescription);
            }
        });
    });
}

function generatePolicyDocument(region, accountId, clientId) {
    return {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "iot:Connect"
                ],
                "Resource": `arn:aws:iot:${region}:${accountId}:client/${clientId}`
            },
            {
                "Effect": "Allow",
                "Action": [
                    "iot:Publish",
                    "iot:Receive",
                    'iot:GetThingShadow',
                    'iot:UpdateThingShadow'
                ],
                "Resource": `arn:aws:iot:${region}:${accountId}:topic/$aws/things/\${iot:ClientId}/shadow/*`
            },
            {
                "Effect": "Allow",
                "Action": [
                    "iot:Subscribe",
                ],
                "Resource": `arn:aws:iot:${region}:${accountId}:topicfilter/\${iot:ClientId}/#`
            }
        ]
    };
}

exports.handler = function (event, context, callback) {
    const region = process.env.AWS_REGION;
    const accountId = event.awsAccountId.toString().trim();
    const certificateId = event.certificateId.toString().trim();
    console.log(`JITR invoked for region: ${region}, account: ${accountId}, certificate: ${certificateId}`);

    const iot = new AWS.Iot({
        region,
        apiVersion: '2015-05-28'
    });

    describeCertificate(iot, { certificateId })
        .then(certificateDescription => certificateDescription.certificatePem)
        .then(certificatePem => getCertificateCommonName(certificatePem))
        .then(clientId => {
            const certificateARN = `arn:aws:iot:${region}:${accountId}:cert/${certificateId}`;
            const policyName = `Policy_${certificateId}`;
            const policy = generatePolicyDocument(region, accountId, clientId);

            createThing(iot, { thingName: clientId })
                .then(() => createPolicy(iot, {
                    policyDocument: JSON.stringify(policy),
                    policyName: policyName
                }))
                .then(() => attachPrincipalPolicy(iot, {
                    policyName: policyName,
                    principal: certificateARN
                }))
                .then(() => attachThingPrincipal(iot, {
                    thingName: clientId,
                    principal: certificateARN
                }))
                .then(() => updateCertificate(iot, {
                    certificateId: certificateId,
                    newStatus: 'ACTIVE'
                }))
                .then(() => {
                    callback(null, `Success. Created thing '${clientId}' with certificate '${certificateId}'`);
                });
            });
};
