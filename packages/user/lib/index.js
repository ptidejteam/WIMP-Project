const app = require("./app");
require('dotenv').config();
const PORT = process.env.PORT || 3001;


// Listening on the specified port
app.listen(PORT, async () => {
  console.log("User service running on port: " + PORT);
});

app.on('error', (error) => {
  console.error("Server error:", error);
  process.exit(1);
});
