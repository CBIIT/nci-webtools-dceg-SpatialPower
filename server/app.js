const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const compression = require('compression');
const archiver = require('archiver');
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
            body.directory = path.resolve(config.results.folder, id);
            await fs.promises.mkdir(body.directory, {recursive: true});

            // perform calculation and return results
            const sourcePath = path.resolve(__dirname, 'app.R');
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
        
        // validate id format
        if (!/^[a-z0-9]+$/i.test(body.id)) {
            throw("Invalid ID");
        }

        body.directory = path.resolve(config.results.folder, body.id);
        body.rds_file = 'results.rds';
        const sourcePath = path.resolve(__dirname, 'app.R');
        const results = r(sourcePath, 'replot', [body]);
        response.json(results);
    } catch(error) {
        const errorText = String(error.stderr || error);
        logger.error(errorText);
        response.status(500).json(errorText);
    }
});

// generates a zip file containing exported plots
apiRouter.post('/export-plots', async (request, response) => {
    try {
        let body = {
            plot_format: 'png',
            plot_width: 600,
            plot_height: 600,
            ...request.body
        };

        // validate id format
        if (!/^[a-z0-9]+$/i.test(body.id)) {
            throw('Invalid id');
        }

        // validate image format
        if (!['bmp', 'jpeg', 'png', 'tiff'].includes(body.plot_format))
            throw('Invalid format')        

        // create temporary directory
        body.rds = path.resolve(config.results.folder, body.id, 'results.rds');
        body.directory = await fs.promises.mkdtemp(
            path.resolve(config.results.folder, `${body.id}-export-`)
        );

        // clamp dimensions between 100 x 100 and 10,000 x 10,000
        const [min, max] = [100, 10000];
        body.plot_width = Math.max(min, Math.min(max, body.plot_width));
        body.plot_height = Math.max(min, Math.min(max, body.plot_height));

        // generate plots
        const sourcePath = path.resolve(__dirname, 'app.R');
        let results = r(sourcePath, 'replot', [body]);
        if (!Array.isArray(results)) results = [results];

        // zip exported plots
        const zipFileName = `${body.directory}.zip`;
        const output = fs.createWriteStream(zipFileName);
        const archive = archiver('zip');

        // send generated zip file
        output.on('close', () => response.json(path.basename(zipFileName)));
        archive.on('error', err => {throw err});
        archive.pipe(output);
        archive.directory(body.directory, false);
        archive.finalize();
    } catch(error) {
        logger.error(error);
        response.status(500).json(error.toString());
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
            throw("Invalid ID");
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
            throw("Invalid ID");

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