const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MeetingRouter = require("./routes/routes.config.js");
const {runSeed} = require("./routes/models/meeting.seed.js");
const { setupLogging } = require("../../user/lib/utils/logging.js");

require("./services/calendar.service.js");
require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });


// startSubscriptions();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
  );
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
app.use(bodyParser.json());

// Setting up the logging
setupLogging(app);


/// Check if we need to seed the database or not 
/// Beware this will delete all the old data that exists in the database 
if(process.env.SEED_DB === 'true') { 
  runSeed()
}


// Route definition
MeetingRouter.routesConfig(app);

module.exports = app;
