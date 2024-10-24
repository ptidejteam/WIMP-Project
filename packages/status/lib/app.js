const express = require("express");
const StatusRouter = require("./routes/status.routes"); // Import Status Router
const bodyParser = require('body-parser');

// Define the express object
const app = express();

// CORS Middleware
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Expose-Headers", "Content-Length");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin,Accept, Authorization, Content-Type, X-Requested-With, Range,X-Auth"
    );
    if (req.method == "OPTIONS") {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Body Parser Middleware
app.use(bodyParser.json());

// Config status router
StatusRouter.routesConfig(app); // Add Status Router here

module.exports = app;
