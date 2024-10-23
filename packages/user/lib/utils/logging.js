const morgan = require('morgan');

exports.setupLogging = (app) => {
    // Set up logging with 'combined' format
    app.use(morgan('combined'));

    // Optional: You can add custom logs or further configurations
    console.log('HTTP request logging has been enabled with Morgan.');
};
