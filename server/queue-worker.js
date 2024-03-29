const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const r = require('r-wrapper').async;
const config = require('./config.json');
const createLogger = require('./utils/logger');
const logger = createLogger('spatial-power', config.logs);

(async function main() {
    // update aws configuration if all keys are supplied, otherwise
    // fall back to default credentials/IAM role
    if (config.aws) {
        AWS.config.update(config.aws);
    }

    // create required folders 
    for (let folder of [config.logs.folder, config.results.folder]) {
        fs.mkdirSync(folder, { recursive: true });
    }

    receiveMessage();
})();

/**
 * Reads a template, substituting {tokens} with data values
 * @param {string} filepath 
 * @param {object} data 
 */
async function readTemplate(filePath, data) {
    const template = await fs.promises.readFile(path.resolve(filePath));

    // replace {tokens} with data values or removes them if not found
    return String(template).replace(
        /{[^{}]+}/g,
        key => data[key.replace(/[{}]+/g, '')] || ''
    );
}

/**
 * Writes the contents of a stream to a file and resolves once complete
 * @param {*} readStream 
 * @param {*} filePath 
 */
function streamToFile(readStream, filePath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        const stream = readStream.pipe(file);
        stream.on('error', error => reject(error));
        stream.on('close', _ => resolve());
    });
}

/**
 * Processes a message and sends emails when finished
 * @param {object} params 
 */
async function processMessage(message) {
    const s3 = new AWS.S3();
    const email = nodemailer.createTransport(config.email.smtp);

    const { Body: object } = await s3.getObject({
        Bucket: config.s3.bucket,
        Key: message
    }).promise()
    const params = JSON.parse(object)

    try {
        // get calculation results
        const directory = path.resolve(config.results.folder, params.id);
        params.directory = directory;
        const sourcePath = path.resolve(__dirname, 'app.R');
        await fs.promises.mkdir(directory, { recursive: true });

        const start = new Date().getTime();
        const results = await r(sourcePath, 'calculate', { params: params });
        const end = new Date().getTime();

        const time = end - start;
        const minutes = Math.floor(time / 60000);
        var seconds = ((time % 60000) / 1000).toFixed(0);

        var runtime = (minutes > 0 ? minutes + " min " : '') + seconds + " secs"

        // upload results
        await s3.upload({
            Body: JSON.stringify(results),
            Bucket: config.s3.bucket,
            Key: `${config.s3.outputKeyPrefix}${params.id}/results.json`
        }).promise();

        await s3.upload({
            Body: fs.createReadStream(path.resolve(directory, 'results.rds')),
            Bucket: config.s3.bucket,
            Key: `${config.s3.outputKeyPrefix}${params.id}/results.rds`
        }).promise();

        // upload plots
        for (let filename of results.plots) {
            const filepath = path.resolve(directory, filename);
            await s3.upload({
                Body: fs.createReadStream(filepath),
                Bucket: config.s3.bucket,
                Key: `${config.s3.outputKeyPrefix}${params.id}/${filename}`
            }).promise();
        }

        // specify email template variables
        const templateData = {
            jobName: params.job_name,
            numSims: params.sim_total,
            originalTimestamp: params.timestamp,
            runTime: runtime,
            resultsUrl: `${config.email.baseUrl}/#/sparrpowR/${params.id}`
        };

        // send user success email
        logger.info(`Sending user success email`);
        const userEmailResults = await email.sendMail({
            from: config.email.sender,
            to: params.email,
            subject: 'SparrpowR Simulation Results - ' + params.job_name + " - " + params.timestamp + " UTC",
            html: await readTemplate(__dirname + '/templates/user-success-email.html', templateData),
        });

        return true;
    } catch (e) {
        logger.error(e);

        // template variables
        const templateData = {
            jobName: params.job_name,
            numSims: params.sim_total,
            id: params.id,
            parameters: JSON.stringify(params, null, 4),
            originalTimestamp: params.timestamp,
            runTime: runtime,
            exception: e.toString(),
            processOutput: e.stdout ? e.stdout.toString() : null,
            supportEmail: config.email.admin,
        };

        // send admin error email
        logger.info(`Sending admin error email`);
        const adminEmailResults = await email.sendMail({
            from: config.email.sender,
            to: config.email.admin,
            subject: `SparrpowR Error: ${params.id}`, // searchable calculation error subject
            html: await readTemplate(__dirname + '/templates/admin-failure-email.html', templateData),
        });

        // send user error email
        if (params.email) {
            logger.info(`Sending user error email`);
            const userEmailResults = await email.sendMail({
                from: config.email.sender,
                to: params.email,
                subject: 'SparrpowR Simulation Results - ' + params.job_name + " - " + params.timestamp + " UTC (FAILED)",
                html: await readTemplate(__dirname + '/templates/user-failure-email.html', templateData),
            });
        }

        return false;
    }
}

/**
 * Receives messages from the queue at regular intervals,
 * specified by config.pollInterval
 */
async function receiveMessage() {
    const sqs = new AWS.SQS();
    const { QueueUrl } = await sqs.getQueueUrl({
        QueueName: config.queue.name
    }).promise();

    try {
        // to simplify running multiple workers in parallel, 
        // fetch one message at a time
        const data = await sqs.receiveMessage({
            QueueUrl: QueueUrl,
            MaxNumberOfMessages: 1,
            VisibilityTimeout: config.queue.visibilityTimeout,
            WaitTimeSeconds: 20,
        }).promise();

        if (data.Messages && data.Messages.length > 0) {
            const message = data.Messages[0];
            const params = JSON.parse(message.Body);

            logger.info(`Received Message : ${message.Body}`);

            // while processing is not complete, update the message's visibilityTimeout
            const intervalId = setInterval(_ => sqs.changeMessageVisibility({
                QueueUrl: QueueUrl,
                ReceiptHandle: message.ReceiptHandle,
                VisibilityTimeout: config.queue.visibilityTimeout
            }).send(), 1000 * (config.queue.visibilityTimeout - 1));

            // processMessage should return a boolean status indicating success or failure
            const status = await processMessage(params);
            clearInterval(intervalId);

            // if message was not processed successfully, send it to the
            // error queue (add metadata in future if needed)
            if (!status && config.queue.errorUrl) {
                // generate new unique id for error message
                const id = crypto.randomBytes(16).toString('hex');
                await sqs.sendMessage({
                    QueueUrl: config.queue.errorUrl,
                    MessageDeduplicationId: id,
                    MessageGroupId: id,
                    MessageBody: JSON.stringify(params),
                }).promise();
            }

            // remove original message from queue once processed
            await sqs.deleteMessage({
                QueueUrl: QueueUrl,
                ReceiptHandle: message.ReceiptHandle
            }).promise();
        }
    } catch (e) {
        // catch exceptions related to sqs
        logger.error(e);
    } finally {
        // schedule receiving next message
        setTimeout(receiveMessage, 1000 * (config.queue.pollInterval || 60));
    }
}

