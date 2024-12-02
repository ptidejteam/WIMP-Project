const app = require("./app");
const PORT = process.env.PORT;
const { publish } = require("@wimp-project/rabbitmq");

// listening
app.listen(PORT, async() => {
  console.log("Meeting service running on port :" + PORT);
  await publish("front","wimp-system","meeting-request");
  await publish("front","wimp-system","meeting");
});

app.on("error", (error) => {
  if (error) {
    console.error(error);
    return process.exit(1);
  } else {
    console.log("express main configured  and listening on port:.");
  }
});
