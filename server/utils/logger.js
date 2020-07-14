// const winston = require('winston');
// winston.emitErrs = true;
const path = require('path');
const { createLogger, format, transports } = require('winston');
const { folder: logFolder, level: logLevel } = require('../config.json').logs;
require('winston-daily-rotate-file');

module.exports = new createLogger({
  level: logLevel || 'info',
  format: format.combine(
    format.errors({ stack: true }), // <-- use errors format
    // format.colorize(),
    format.timestamp(),
    format.prettyPrint(),
    format.label({ label: '[SPARRPOWR-SERVER]' }),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `[${info.timestamp}] [${info.level}] ${
        info.level === 'error' ? info.stack : info.message
    }`),
    //
    // The simple format outputs
    // `${level}: ${message} ${[Object with everything else]}`
    //
    // format.simple(),
    //
    // Alternatively you could use this custom printf format if you
    // want to control where the timestamp comes in your final message.
    // Try replacing `format.simple()` above with this:
    //
  ),
  transports: [
    new (transports.DailyRotateFile)({
      filename: path.resolve(logFolder, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: false,
      maxSize: '1024m',
      timestamp: true,
      maxFiles: '1d',
      prepend: true
    }),
    new transports.Console()
  ],
  exitOnError: false
});