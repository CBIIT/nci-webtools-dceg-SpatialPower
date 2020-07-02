const fs = require('fs');
const https = require('https');
const path = require('path');
const AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');
const email = require('./utils/email');
const config = require('./config.json');


// use credentials from config.json if supplied, otherwise
// fall back to default credentials locations/IAM role
if (config.queue.accessKeyId && config.queue.secretAccessKey) {
  AWS.config.update({
    region: config.queue.region,
    accessKeyId: config.queue.accessKeyId,
    secretAccessKey: config.queue.secretAccessKey
  });
}

const app = Consumer.create({
  queueUrl: config.queue.url,
  handleMessage: async (message) => {
    try {

      /*
      let params = JSON.parse(message);

      const results = r(
        path.resolve(__dirname, 'calculate.R'), // path to R source file
        'calculate', // name of method to call
        [{
          ...request.body,
          workingDirectory: path.resolve(config.results.folder),
          id,
        }]
      )


      const calculate = r.bind(null, path.resolve(__dirname, 'calculate.R'), 'calculate');
      const params = {
        ...request.body,
        workingDirectory: path.resolve(config.results.folder),
        id,
      };
      const results = calculate({ params });
      */
    } catch (error) {
      logger.error(error);
      throw ({ error, message })
    }
  },
  sqs: new AWS.SQS({
    httpOptions: {
      agent: new https.Agent({
        keepAlive: true
      })
    }
  })
});

// register error handler
app.on('error', handleError);
app.on('processing_error', handleError);

async function handleError(error) {
  console.log('ERROR', error);
  const data = error.data;
  const errorMessage = error.message;
  const templateData = {
    id: error.id,
    message: error.message,
  };

  // send admin error email
  const adminEmailResults = await email.sendMail({
    from: config.email.sender,
    to: config.email.admin,
    subject: 'SparrpowR Error',
    html: readTemplate(__dirname + '/templates/admin-failure-email.html', templateData),
  });

  // send user error email
  const userEmailResults = await email.sendMail({
    from: config.email.sender,
    to: data.email,
    subject: 'SparrpowR Error',
    html: readTemplate(__dirname + '/templates/user-failure-email.html', templateData),
  });
}

/**
 * Reads a template, substituting {tokens} with data values
 * @param {*} filepath 
 * @param {*} data 
 */
function readTemplate(filePath, data) {
  const template = fs.readFileSync(path.resolve(filePath)).toString();

  // replace {tokens} with data values
  // or removes them if not found
  return template.replace(
    /{[^{}]+}/g,
    key => data[key.replace(/[{}]+/g, '')] || ''
  );
}

app.start();
