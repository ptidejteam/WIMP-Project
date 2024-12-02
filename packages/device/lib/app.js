const express = require("express");
const DeviceRouter = require("./routes/routes.config");
const bodyParser = require('body-parser');
const { runSeed } = require("./routes/models/device.seed");
const { runService } = require("./services/device.service");
// Define the express object
const app = express();

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
app.use(bodyParser.json());




// Config device router
DeviceRouter.routesConfig(app);
/// Check if we need to seed the database or not 
/// Beware this will delete all the old data that exists in the database 
if(process.env.SEED_DB === 'true') { 
  runSeed();
}
runService();

module.exports = app;
