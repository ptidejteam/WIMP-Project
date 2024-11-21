const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MeetingRouter = require("./routes/routes.config.js");

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const { subscribe } = require("@wimp-project/rabbitmq");

// Callback to handle incoming messages
function messageHandler(message) {
  console.log("Received message:", message);
}

// Subscribe to the communication channel to start running the meeting checks
// to start the calendar check
async function startSubscriptions() {
  // Subscribe to different queues bound to different exchanges
  await subscribe(process.env.SERVICE_QUEUE, messageHandler, {
    exchange: "user-connection",
    routingKey: "wimp-system",
  });
  await subscribe(process.env.SERVICE_QUEUE, messageHandler, {
    exchange: "user-availability",
    routingKey: "wimp-system",
  });
}

startSubscriptions();

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
// setupLogging(app);

// Route definition
MeetingRouter.routesConfig(app);

module.exports = app;
