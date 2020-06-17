const nodemailer = require('nodemailer');
const config = require('../config.json');
const aws = require('aws-sdk');

// use credentials from config.json if supplied, otherwise
// fall back to default credentials locations/IAM role
if (config.email.accessKeyId && config.email.secretAccessKey) {
    aws.config.update({
        region: config.email.region,
        accessKeyId: config.email.accessKeyId,
        secretAccessKey: config.email.secretAccessKey
    });
}
  
// create Nodemailer SES transporter
module.exports = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: '2010-12-01'
    })
});
