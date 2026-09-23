const util = require("util");
const { createLogger, format, transports } = require("winston");

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

// Logs to stdout/stderr only
function getLogger(name, { level } = {}) {
  return new createLogger({
    level: level || "info",
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.label({ label: name }),
      format.printf(formatLogMessage)
    ),
    transports: [new transports.Console()],
    exitOnError: false,
  });
}

module.exports = getLogger;
