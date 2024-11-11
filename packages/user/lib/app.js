const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const IdentityRouter = require('./routes/routes.config');
const SecurityRouter = require('./security/routes.config');
const { setupLogging } = require("./utils/logging");
const { runSeed } = require('./routes/models/identity.seed');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env' )});

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin',"*" );
    res.header('Access-Control-Allow-Methods', 'GET,GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Origin,Accept, Authorization, Content-Type, X-Requested-With, Range,X-Auth');
    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
      }
      else {
        next();
      }
    });
app.use(bodyParser.json());

// Setting up the logging
setupLogging(app);
// Route definition
IdentityRouter.routesConfig(app);
SecurityRouter.routesConfig(app);


/// Check if we need to seed the database or not 
/// Beware this will delete all the old data that exists in the database 
if(process.env.SEED_DB === 'true') { 
  runSeed()
}

module.exports = app;
