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
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Create a stream object with a 'write' function to use with morgan
const morganStream = {
    write: (message) => logger.info(message.trim())
};

// Setup Morgan to use the Winston stream
exports.setupLogging = (app) => {
    app.use(morgan('combined', { stream: morganStream }));
    console.log('HTTP request logging is enabled with Morgan and Winston.');
};
