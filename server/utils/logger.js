const path = require("path");
const util = require("util");
const fs = require("fs");
const { createLogger, format, transports, info } = require("winston");
const logConfig = require("../config.json").logs;
require("winston-daily-rotate-file");

function objectToString(obj) {
  return ["string", "number"].includes(typeof obj)
    ? obj
    : util.inspect(obj, { depth: null, compact: true, breakLength: Infinity });
}

function formatLogMessage({ label, timestamp, level, message }) {
  return [
    [label, process.pid, timestamp, level]
      .filter(Boolean)
      .map((s) => `[${s}]`)
      .join(" "),
    objectToString(message),
  ].join(" - ");
}

function getLogger(name, config = logConfig) {
  const { folder, level } = config;
  fs.mkdirSync(folder, { recursive: true });

  return new createLogger({
    level: level || "info",
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.label({ label: name }),
      format.printf(formatLogMessage)
    ),
    transports: [
      new transports.Console(),
      new transports.DailyRotateFile({
        filename: path.resolve(folder, `${name}-%DATE%.log`),
        datePattern: "YYYY-MM-DD-HH",
        zippedArchive: false,
        maxSize: "1024m",
        timestamp: true,
        maxFiles: "1d",
        prepend: true,
      }),
    ],
    exitOnError: false,
  });
}

module.exports = getLogger;
