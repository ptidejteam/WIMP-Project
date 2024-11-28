const { google } = require("googleapis");
const cron = require("node-cron");
const { subscribe, publish } = require("@wimp-project/rabbitmq");
const Meeting = require("../routes/models/meeting.model");

// Google Calendar API setup
const calendar = google.calendar("v3");

// In-memory storage for user tokens
const userTokens = new Map();

/**
 * Handles user connection messages from RabbitMQ.
 */
async function onConnectHandler(message) {
  try {
    const { _id, googleAccessToken, googleAccessTokenExpiry } = JSON.parse(message);
    if (_id && googleAccessToken && googleAccessTokenExpiry) {
      userTokens.set(_id, { googleAccessToken, googleAccessTokenExpiry });
      console.log(`Token updated for user: ${_id}`);
    } else {
      console.warn(`Invalid connection data received: ${message}`);
    }
  } catch (error) {
    console.error(`Error processing connection message: ${error.message}`);
  }
}

/**
 * Handles user disconnection messages from RabbitMQ.
 */
async function onDisconnectHandler(message) {
  try {
    const { _id } = JSON.parse(message);
    if (userTokens.delete(_id)) {
      await Meeting.deleteMany({ requestedUserId: _id, source: "external" });
      console.log(`Token removed and meetings cleared for user: ${_id}`);
    } else {
      console.warn(`No token found for user: ${_id}`);
    }
  } catch (error) {
    console.error(`Error processing disconnection message: ${error.message}`);
  }
}

/**
 * Subscribes to RabbitMQ channels for user connection and disconnection.
 */
async function startSubscriptions() {
  try {
    const options = { exchange: "wimp-system", routingKey: "wimp-system" };

    await subscribe(process.env.SERVICE_CONNECTION_QUEUE, onConnectHandler, {
      ...options,
      exchange: "user-connection",
    });
    console.log("Subscribed to user-connection channel.");

    await subscribe(process.env.SERVICE_DISCONNECTION_QUEUE, onDisconnectHandler, {
      ...options,
      exchange: "user-disconnection",
    });
    console.log("Subscribed to user-disconnection channel.");
  } catch (error) {
    console.error(`Error subscribing to channels: ${error.message}`);
  }
}

/**
 * Checks if the token for a user is valid.
 */
function isTokenValid(userId) {
  const userToken = userTokens.get(userId);
  if (!userToken) {
    console.log(`No token available for user: ${userId}`);
    return false;
  }

  const { googleAccessTokenExpiry } = userToken;
  if (Date.now() >= new Date(googleAccessTokenExpiry).getTime()) {
    console.log(`Token expired for user: ${userId}`);
    return false;
  }

  return true;
}

/**
 * Fetches Google Calendar events for a specific user.
 */
async function fetchGoogleCalendarEvents(userId) {
  if (!isTokenValid(userId)) {
    return;
  }

  const { googleAccessToken } = userTokens.get(userId);

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: googleAccessToken });

    const response = await calendar.events.list({
      auth: oauth2Client,
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 20,
    });

    const events = response.data.items || [];
    console.log(`Fetched ${events.length} events for user: ${userId}.`);
    await saveEventsToDatabase(userId, events);
    publish("front","wimp-system","meeting").then(() => console.log("front notification sent")).catch((err) => console.error("something went wrong"));
  } catch (error) {
    console.error(`Error fetching events for user ${userId}: ${error.message}`);
  }
}

/**
 * Saves or updates Google Calendar events in the database.
 */
async function saveEventsToDatabase(userId, events) {
  if (!events.length) {
    console.log(`No events to save for user: ${userId}.`);
    return;
  }

  try {
    const upsertPromises = events.map((event) => {
      const meetingData = {
        requesterId: userId,
        eventId: event.id,
        summary: event.summary || "",
        description: event.description || "",
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        location: event.location || "",
        status: event.status || "confirmed",
        source: "external",
      };

      return Meeting.updateOne(
        { requesterId: userId, eventId: event.id },
        { $set: meetingData },
        { upsert: true }
      );
    });

    await Promise.all(upsertPromises);
    console.log(`Saved/Updated ${events.length} events for user: ${userId}.`);
  } catch (error) {
    console.error(`Error saving events to database: ${error.message}`);
  }
}

/**
 * Schedules periodic fetching of Google Calendar events.
 */
function listenToGoogleCalendar() {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Checking Google Calendar events...");
    for (const userId of userTokens.keys()) {
      console.log(userId);
      await fetchGoogleCalendarEvents(userId);
    }
  });
}

// Initialize subscriptions and start fetching
(async function initialize() {
  await startSubscriptions();
  listenToGoogleCalendar();
})();
