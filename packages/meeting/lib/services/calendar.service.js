const { google } = require("googleapis");
const cron = require("node-cron"); // Import node-cron
const { subscribe } = require("@wimp-project/rabbitmq");
const Meeting = require("../routes/models/meeting.model"); // Replace with your current event/meeting model

// Google Calendar API setup
const calendar = google.calendar("v3");

// Map to store user tokens retrieved from the channel
const userTokens = new Map();

// Callback to handle incoming RabbitMQ connection messages
async function onConnectHandler(message) {
  try {
    console.log(message);
    const { _id, googleAccessToken, googleAccessTokenExpiry } =
      JSON.parse(message);

    // Store user token in the map
    userTokens.set(_id, { googleAccessToken, googleAccessTokenExpiry });
    console.log(`Updated token for user: ${_id}`);
  } catch (error) {
    console.error(`Error processing connection message: ${error.message}`);
  }
}

// Callback to handle incoming RabbitMQ disconnection messages
async function onDisconnectHandler(message) {
  try {
    const { _id } = JSON.parse(message);

    // Remove user token from the map
    if (userTokens.has(_id)) {
      userTokens.delete(_id);
      console.log(`Removed token for user: ${_id}`);
    } else {
      console.warn(`No token found for user: ${_id}`);
    }
  } catch (error) {
    console.error(`Error processing disconnection message: ${error.message}`);
  }
}

// Subscribe to RabbitMQ communication channels
async function startSubscriptions() {
  try {
    // Subscribe to the user-connection channel
    await subscribe(process.env.SERVICE_QUEUE, onConnectHandler, {
      exchange: "user-connection",
      routingKey: "wimp-system",
    });
    console.log("Subscription to user-connection channel started.");

    // Subscribe to the user-disconnection channel
    await subscribe(process.env.SERVICE_QUEUE, onDisconnectHandler, {
      exchange: "user-disconnection",
      routingKey: "wimp-system",
    });
    console.log("Subscription to user-disconnection channel started.");
  } catch (error) {
    console.error(`Error subscribing to channels: ${error.message}`);
  }
}

// Subscribe to RabbitMQ communication channel
async function startSubscriptions() {
  try {
    await subscribe(process.env.SERVICE_QUEUE, onConnectHandler, {
      exchange: "user-connection",
      routingKey: "wimp-system",
    });

    await subscribe(process.env.SERVICE_QUEUE, onDisconnectHandler, {
      exchange: "user-disconnection",
      routingKey: "wimp-system",
    });
    console.log("Subscription to user-connection channel started.");
  } catch (error) {
    console.error(`Error subscribing to channel: ${error.message}`);
  }
}

// Function to fetch Google Calendar events for a specific user
async function fetchGoogleCalendarEvents(userId) {
  try {
    const userToken = userTokens.get(userId);

    if (!userToken || !userToken.googleAccessToken) {
      console.log(`No Google access token available for user: ${userId}`);
      return;
    }

    // Check if the access token has expired
    if (Date.now() >= new Date(userToken.googleAccessTokenExpiry).getTime()) {
      console.log(`Google access token expired for user: ${userId}`);
      return;
    }

    // Configure OAuth2 client with the user's access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: userToken.googleAccessToken });

    // Fetch events from Google Calendar
    const response = await calendar.events.list({
      auth: oauth2Client,
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    console.log(`Fetched ${events.length} events for user ${userId}.`);

    // Save or update events in the database
    await saveEventsToDatabase(userId, events);
  } catch (error) {
    console.error(
      `Error fetching Google Calendar events for user ${userId}: ${error.message}`
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
    for (const event of events) {
      const meetingData = {
        requesterId: userId,
        eventId: event.id,
        summary: event.summary || "",
        description: event.description || "",
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        location: event.location || "",
        status: event.status || "confirmed",
        source: "external", // Since this comes from Google Calendar
      };

      // Upsert the event (insert if not exists, update if it exists)
      await Meeting.updateOne(
        { requesterId: userId, eventId: event.id },
        { $set: meetingData },
        { upsert: true } // Create a new record if none exists
      );
    }

    console.log(`Saved/Updated events for user ${userId} in the database.`);
  } catch (error) {
    console.error(`Error saving events to the database: ${error.message}`);
  }
}

// Function to periodically fetch Google Calendar events
function listenToGoogleCalendar() {
  // Schedule task to run every minute (adjust as needed)
  cron.schedule("*/1 * * * *", async () => {
    console.log("Checking Google Calendar events...");
    for (const userId of userTokens.keys()) {
      await fetchGoogleCalendarEvents(userId);
    }
  });
}

// Initialize subscriptions and start listening
startSubscriptions();
listenToGoogleCalendar();
