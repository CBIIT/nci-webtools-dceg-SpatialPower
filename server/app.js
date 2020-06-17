const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const compression = require('compression')
const { Producer } = require('sqs-producer');
const r = require('r-wrapper');
const config = require('./config.json');
const logger = require('./utils/logger');

// create sqs producer
const producer = Producer.create({
    queueUrl: config.queue.url,
    region: config.queue.region,
    accessKeyId: config.queue.accessKeyId,
    secretAccessKey: config.queue.secretAccessKey,
});

// create express app
const app = express();

// serve public folder
app.use(express.static('public'));

// serve results folder
app.use('/results', express.static('results'));

// json parser middleware
app.use(express.json());

// compress all responses
app.use(compression());

// create folders
for (let folder of [config.logging.folder, config.results.folder])
    if (!fs.existsSync(folder))
        fs.mkdirSync(folder, {recursive: true})

// handle calculation submission
app.post('/submit', async (request, response) => {
    try {
        const id = crypto.randomBytes(16).toString('hex');
        if (request.body.queue) {
            // enqueue message and send a response with the request id
            const message = {body: {id, ...request.body}};
            await producer.send([message]);
            response.json({id}); // return message id
        } else {
            // otherwise, perform calculation and return results
            response.json(r(
                path.resolve(__dirname, 'calculate.R'), // path to R source file
                'calculate', // name of method to call
                [{
                    ...request.body, 
                    workingDirectory: path.resolve(config.results.folder),
                    id, 
                }]
            ));
        }
    } catch(error) {
        logger.error(error);
        response.status(500).json(error.toString());
    }
});

// download plots to results folder and return results from s3 when visiting 
// the application from a queue-generated url
app.get('/fetch-results', async (request, response) => {
    try {
        // find all objects with the specified prefix
        const id = request.params.id; 

        // validate id format
        if (!/^[a-z0-9]$/i.test(id))
            response.json(false);

        const s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            accessKeyId: config.s3.accessKeyId,
            secretAccessKey: config.s3.secretAccessKey,
            params: {Bucket: config.s3.bucket}
        });
    
        // find objects which use the specified id as the prefix
        const objects = await s3.listObjectsV2({
            prefix: id
        }).promise();

        // download results
        for (let key of objects.Contents) {

            // only download png/json files which include the specified id
            if (!(/\.(png|json)$/.test(key) && key.includes(id))) {
                continue;
            }

            logger.info(`Downloading result: ${key}`);
            const object = await s3.getObject(key).promise();

            fs.writeFileSync(
                path.resolve(config.folder.result, key),
                object.Body
            );
        }

        let resultsFile = path.resolve(config.results.folder, `${id}.json`);
        if (fs.existsSync(resultsFile))
            response.sendFile(resultsFile);
        else
            response.json(false);

    } catch(error) {
        logger.error(error);
        response.status(500).json(error.toString());
    }
});


app.listen(config.port, () => {
    logger.info(`Application is running on port: ${config.port}`)
});