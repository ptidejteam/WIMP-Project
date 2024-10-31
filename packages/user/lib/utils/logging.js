const morgan = require('morgan');
const winston = require('winston');

// Create a winston logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(), // Log to console
        //new winston.transports.File({ filename: 'combined.log' }) // Log to file
    ]
});

// Override console.log to use Winston
console.log = function (message) {
    logger.info(message);
};

// Override console.error to log errors through Winston
console.error = function (message) {
    logger.error(message);
};

// Create a stream object with a 'write' function to use with morgan
const morganStream = {
    write: (message) => logger.info(message.trim()) // Send HTTP logs to Winston
};

// Setup Morgan to use the Winston stream
exports.setupLogging = (app) => {
    app.use(morgan('combined', { stream: morganStream }));
    logger.info('HTTP request logging is enabled with Morgan and Winston.');

    // Error-handling middleware to log errors
    app.use((err, req, res, next) => {
        logger.error(`Error: ${err.message} | Request: ${req.method} ${req.url}`);
        res.status(500).send("Internal Server Error");
    });
};
