const app = require("./app");
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const { listenToGoogleCalendar } = require("./service/calendar.service");
const cron = require("node-cron");

// Schedule the Google Calendar listener to run every hour
// cron.schedule("0 * * * *", async () => {
//   console.log("Running Google Calendar listener...");
//   try {
//     await listenToGoogleCalendar();
//   } catch (error) {
//     console.error("Error in Google Calendar listener:", error);
//   }
// });

// Listening on the specified port
app.listen(PORT, () => {
  console.log("User service running on port: " + PORT);
  listenToGoogleCalendar();
});

app.on('error', (error) => {
  console.error("Server error:", error);
  process.exit(1);
});
