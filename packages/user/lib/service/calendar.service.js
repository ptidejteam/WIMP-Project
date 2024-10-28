const { google } = require("googleapis");
const Identity = require("../routes/models/identity.model"); // Import your User model
const cron = require("node-cron"); // Import node-cron

// Google Calendar API setup
const calendar = google.calendar("v3");

// Function to check and get calendar events
async function fetchGoogleCalendarEvents(userId) {
  try {
    const user = await Identity.findById(userId);
    if (!user || !user.googleAccessToken) {
      console.log(`No Google access token available for user: ${userId}`);
      return;
    }

    // Check if the access token has expired
    if (Date.now() >= new Date(user.googleAccessTokenExpiry).getTime()) {
      console.log(`Google access token expired for user: ${userId} - ${new Date(user.googleAccessTokenExpiry).getTime()}`);
      return;
    }

    // Set up OAuth2 client with the user's access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: user.googleAccessToken });

    // Fetch the list of events from Google Calendar
    const response = await calendar.events.list({
      auth: oauth2Client,
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10, // Limit the results as needed
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items;
    console.log(`Fetched ${events.length} events for user ${userId}.`);

    // Save or update events in the database
    await saveEventsToDatabase(userId, events);
  } catch (error) {
    console.error(
      `Error fetching Google Calendar events for user: ${userId} , ${error}`
    );
  }
}

// Function to save fetched events to the database
async function saveEventsToDatabase(userId, events) {
  if (!events || events.length === 0) {
    console.log(`No events to save for user ${userId}.`);
    return;
  }

  try {
    const eventRecords = events.map((event) => ({
      eventId: event.id,
      summary: event.summary,
      description: event.description,
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      location: event.location,
      status: event.status,
    }));

    await Identity.findByIdAndUpdateEvents(userId,eventRecords);

    console.log(`Updated events for user ${userId} in the database.`);
  } catch (error) {
    console.error(
      `Error saving events to the database for user: ${error}`
    );
  }
}

// Schedule task to check Google Calendar periodically using node-cron
function listenToGoogleCalendar() {
  // Schedule to run every 5 seconds
  cron.schedule("*/5 * * * * *", async () => {
    console.log("Checking Google Calendar events...");
    const users = await Identity.findIfTokenExists();
    for (const user of users) {
      await fetchGoogleCalendarEvents(user._id);
    }
  });
}

// Export the function to start the listening service
module.exports = { listenToGoogleCalendar };
