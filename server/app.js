const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const compression = require('compression')
const AWS = require('aws-sdk');
const r = require('r-wrapper');
const config = require('./config.json');
const logger = require('./utils/logger');

const app = express();
const apiRouter = express.Router();
app.use('/api', apiRouter);

// serve public folder during local development
if (process.env.NODE_ENV !== 'production')
    app.use(express.static(config.server.static));

// serve results under /api/results
apiRouter.use('/results', express.static(config.results.folder));

// parse json requests
apiRouter.use(express.json());

// compress all responses
apiRouter.use(compression());

// healthcheck route
apiRouter.use('/ping', (request, response) => response.json(true));

// handle calculation submission
apiRouter.post('/submit', async (request, response) => {
    try {
        // generate unique id for response
        const id = crypto.randomBytes(16).toString('hex');

        // assign id to body
        let body = {...request.body, id};

        // set empty strings in body
        for (const key in body)
            if (body[key] === '')
                delete body[key];

        if (body.queue) {
            // enqueue message and send a response with the request id
            await new AWS.SQS().sendMessage({
                QueueUrl: config.queue.url,
                MessageDeduplicationId: id,
                MessageGroupId: id,
                MessageBody: JSON.stringify(body)
            }).promise();
            response.json({id});
        } else {
            // ensure working directory exists
            body.workingDirectory = path.resolve(config.results.folder, id);
            await fs.promises.mkdir(body.workingDirectory, {recursive: true});

            // perform calculation and return results
            const sourcePath = path.resolve(__dirname, 'calculate.R');
            const results = r(sourcePath, 'calculate', [body]);
            response.json(results);
        }
    } catch(error) {
        const errorText = String(error.stderr || error);
        logger.error(errorText);
        response.status(500).json(errorText);
    }
});


// handle replotting
apiRouter.post('/replot', async (request, response) => {
    try {
        let { body } = request;

        // ensure working directory exists
        body.workingDirectory = path.resolve(config.results.folder, body.id);
        await fs.promises.mkdir(body.workingDirectory, {recursive: true});

        // replot
        const sourcePath = path.resolve(__dirname, 'calculate.R');
        const results = r(sourcePath, 'replot', [body]);
        response.json(results);

    } catch(error) {
        const errorText = String(error.stderr || error);
        logger.error(errorText);
        response.status(500).json(errorText);
    }
});


// download plots to results folder and return results from s3 when visiting 
// the application from a queue-generated url
apiRouter.get('/fetch-results', async (request, response) => {
    try {
        const s3 = new AWS.S3();
        const { id } = request.query; 

        // validate id format
        if (!/^[a-z0-9]+$/i.test(id)) {
            return response.json(false);
        }

        // ensure output directory exists
        const resultsFolder = path.resolve(config.results.folder, id);
        await fs.promises.mkdir(resultsFolder, {recursive: true});

        // find objects which use the specified id as the prefix
        const objects =  await s3.listObjectsV2({
            Bucket: config.s3.bucket,
            Prefix: `${config.s3.outputKeyPrefix}${id}/`,
        }).promise();

        // download results
        for (let {Key} of objects.Contents) {
            logger.info(`Downloading result: ${Key}`);
            const object = await s3.getObject({
                Bucket: config.s3.bucket,
                Key
            }).promise();
            const filename = path.basename(Key);
            await fs.promises.writeFile(
                path.resolve(resultsFolder, filename),
                object.Body
            );
        }

        let resultsFile = path.resolve(resultsFolder, `results.json`);
        if (fs.existsSync(resultsFile))
            response.sendFile(resultsFile);
        else
            response.json(false);

    } catch(error) {
        logger.error(error);
        response.status(500).json(error.toString());
    }
});

app.listen(config.server.port, () => {
    // update aws configuration if supplied
    if (config.aws) {
        AWS.config.update(config.aws);
    }

    // create required folders 
    for (let folder of [config.logs.folder, config.results.folder]) {
        fs.mkdirSync(folder, {recursive: true});
    }

    logger.info(`Application is running on port: ${config.server.port}`)
});