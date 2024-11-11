const app = require("./app");
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const { listenToGoogleCalendar } = require("./service/calendar.service");



// Listening on the specified port
app.listen(PORT, () => {
  console.log("User service running on port: " + PORT);
  listenToGoogleCalendar();
});

app.on('error', (error) => {
  console.error("Server error:", error);
  process.exit(1);
});
