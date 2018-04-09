const AWS = require('aws-sdk');

function createPolicy(iot, options) {
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

function updateCertificate(iot, options) {
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

function generatePolicyDocument(region, accountId, certificateId) {
    return {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "iot:Connect"
                ],
                "Resource": `arn:aws:iot:${region}:${accountId}:client/${certificateId}`
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

module.exports.handler = function (event, context, callback) {
    const region = process.env.AWS_REGION;
    const accountId = event.awsAccountId.toString().trim();
    const certificateId = event.certificateId.toString().trim();

    const certificateARN = `arn:aws:iot:${region}:${accountId}:cert/${certificateId}`;
    const policyName = `Policy_${certificateId}`;
    const policy = generatePolicyDocument(region, accountId, certificateId);

    const policyOptions = {
        policyDocument: JSON.stringify(policy),
        policyName: policyName
    };
    const attachPolicyOptions = {
        policyName: policyName,
        principal: certificateARN
    };
    const updateCertificateOptions = {
        certificateId: certificateId,
        newStatus: 'ACTIVE'
    };

    const iot = new AWS.Iot({'region': region, apiVersion: '2015-05-28'});

    createPolicy(iot, policyOptions)
        .then(() => attachPrincipalPolicy(iot, attachPolicyOptions))
        .then(() => updateCertificate(iot, updateCertificateOptions))
        .then(() => {
            callback(null, `Success. Created, attached policy, and activated certificate ${certificateId}`);
        });
};
