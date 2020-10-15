const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const compression = require('compression');
const archiver = require('archiver');
const AWS = require('aws-sdk');
const r = require('r-wrapper').async;
const config = require('./config.json');
const logger = require('./utils/logger');
const process = require('process')

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
        let body = Object.assign(request.body, {
            id,
            timestamp: new Date().toLocaleString(),
        });

        // remove empty values from body
        for (const key in body)
            if ([null, undefined, ''].includes(body[key]))
                delete body[key];

        if (body.queue) {
            // enqueue message and send a response with the request id
            await new AWS.SQS().sendMessage({
                QueueUrl: config.queue.url,
                MessageDeduplicationId: id,
                MessageGroupId: id,
                MessageBody: JSON.stringify(body)
            }).promise();
            response.json({ id });  
        }
        // ensure working directory exists
        body.directory = path.resolve(config.results.folder, id);
        await fs.promises.mkdir(body.directory, { recursive: true });

        // perform calculation and return results
        const sourcePath = path.resolve(__dirname, 'app.R');
        const results = await r(sourcePath, 'calculate', [body]);
        if (!Array.isArray(results.plots)) results.plots = [results.plots];
        response.json(results);

    } catch (error) {
        const errorText = String(error.stderr || error);
        logger.error(errorText);
        response.status(500).json(errorText);
    }
});


// handle replotting
apiRouter.post('/replot', async (request, response) => {
    try {
        // validate id format
        if (!/^[a-z0-9]+$/i.test(request.body.id)) {
            throw (`Invalid id`);
        }

        const body = Object.assign(request.body, {
            directory: path.resolve(config.results.folder, request.body.id),
            rds_file: 'results.rds',
        });
        const sourcePath = path.resolve(__dirname, 'app.R');
        const results = await r(sourcePath, 'replot', [body]);
        if (!Array.isArray(results.plots)) results.plots = [results.plots];

        response.json(results);
    } catch (error) {
        const errorText = String(error.stderr || error);
        logger.error(errorText);
        response.status(500).json(errorText);
    }
});

// download plots to results folder and return results from s3 when visiting 
// the application from a queue-generated url
apiRouter.get('/fetch-results/:id', async (request, response) => {
    try {
        const s3 = new AWS.S3();
        const { id } = request.params;

        // validate id format
        if (!/^[a-z0-9]+$/i.test(id)) {
            throw (`Invalid id`);
        }

        // ensure output directory exists
        const resultsFolder = path.resolve(config.results.folder, id);
        await fs.promises.mkdir(resultsFolder, { recursive: true });

        // find objects which use the specified id as the prefix
        const objects = await s3.listObjectsV2({
            Bucket: config.s3.bucket,
            Prefix: `${config.s3.outputKeyPrefix}${id}/`,
        }).promise();

        // download results
        for (let { Key } of objects.Contents) {
            const filename = path.basename(Key);
            const filepath = path.resolve(resultsFolder, filename);

            // download results if they do not exist
            if (!fs.existsSync(filepath)) {
                logger.info(`Downloading result: ${Key}`);
                const object = await s3.getObject({
                    Bucket: config.s3.bucket,
                    Key
                }).promise();

                await fs.promises.writeFile(
                    filepath,
                    object.Body
                );
            }
        }

        let paramsFilePath = path.resolve(resultsFolder, `params.json`);
        let resultsFilePath = path.resolve(resultsFolder, `results.json`);
        if (fs.existsSync(resultsFilePath) && fs.existsSync(paramsFilePath)) {
            const params = JSON.parse(String(await fs.promises.readFile(paramsFilePath)));
            const results = JSON.parse(String(await fs.promises.readFile(resultsFilePath)));
            if (!Array.isArray(results.plots)) results.plots = [results.plots];
            response.json({ params, results });
        } else {
            throw (`Invalid id`);
        }

    } catch (error) {
        console.log(error);
        logger.error(error.toString());
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
        fs.mkdirSync(folder, { recursive: true });
    }

    logger.info(`Application is running on port: ${config.server.port}`)
});