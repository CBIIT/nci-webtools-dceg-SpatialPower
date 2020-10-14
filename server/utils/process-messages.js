
const crypto = require('crypto');
const AWS = require('aws-sdk');

/**
 * Receives messages from the queue at regular intervals,
 * specified by config.pollInterval
 */
module.exports = async function processMessages({
    queueUrl, 
    errorUrl, 
    visibilityTimeout = 60, 
    pollInterval = 60, 
    messageHandler,
    errorHandler,
    logger
}) {
    const sqs = new AWS.SQS();

    try {
        // to simplify running multiple workers in parallel, 
        // fetch one message at a time
        const data = await sqs.receiveMessage({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 1,
            VisibilityTimeout: visibilityTimeout,
            WaitTimeSeconds: 20,
        }).promise();

        if (data.Messages && data.Messages.length > 0) {
            const message = data.Messages[0];
            const params = JSON.parse(message.Body);

            logger.info(`Received Message : ${message.Body}`);
            
            // while processing is not complete, update the message's visibilityTimeout
            const intervalId = setInterval(_ => sqs.changeMessageVisibility({
                QueueUrl: queueUrl,
                ReceiptHandle: message.ReceiptHandle,
                VisibilityTimeout: visibilityTimeout
            }).send(), 1000 * (visibilityTimeout - 1));

            // processMessage should return a boolean status indicating success or failure
            const status = await messageHandler(params);
            clearInterval(intervalId);
            
            // if message was not processed successfully, send it to the
            // error queue (add metadata in future if needed)
            if (!status && errorUrl) {
                // generate new unique id for error message
                const id = crypto.randomBytes(16).toString('hex');
                await sqs.sendMessage({
                    QueueUrl: errorUrl,
                    MessageDeduplicationId: id,
                    MessageGroupId: id,
                    MessageBody: JSON.stringify(params),
                }).promise();
            }

            // remove original message from queue once processed
            await sqs.deleteMessage({
                QueueUrl: queueUrl,
                ReceiptHandle: message.ReceiptHandle
            }).promise();
        }
    } catch (e) {
        // catch exceptions related to sqs
        logger.error(e);
    } finally {
        // schedule processing next message
        setTimeout(
            () => processMessages({
                queueUrl, 
                errorUrl, 
                visibilityTimeout, 
                pollInterval, 
                messageHandler,
                logger
            }), 
            1000 * pollInterval
        );
    }
}

