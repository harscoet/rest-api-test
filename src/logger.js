const winston = require("winston");

function setupLogger() {
  return winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
  });
}

module.exports = { setupLogger };
