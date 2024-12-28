const admin = require("firebase-admin");
const deviceModel = require("../routes/models/device.model");
const serviceAccount = require("../../wimp-system-firebase.json");
const { subscribe, publish } = require("@wimp-project/rabbitmq");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_URL,
});

// In-memory storage for user tokens (storing workspaces and lockout area details)
const userWorkSpaces = new Map();

// Reference to Firebase Realtime Database
const db = admin.database();
const locationsRef = db.ref("/locations");

/**
 * Handles user connection messages from RabbitMQ.
 */
async function onConnectHandler(message) {
  try {
    const { _id, workSpaces } = JSON.parse(message);
    console.log("User connected:", { _id, workSpaces });
    // Store workspaces in memory (assuming workspaces include location info and lockout radius)
    userWorkSpaces.set(_id, workSpaces);
  } catch (error) {
    console.error("Error handling connection message:", error.message);
  }
}

/**
 * Handles user disconnection messages from RabbitMQ.
 */
async function onDisconnectHandler(message) {
  try {
    const data = JSON.parse(message);
    console.log("User disconnected:", data);
    // Remove workspaces from memory when user disconnects
    userWorkSpaces.delete(data.userId);
  } catch (error) {
    console.error("Error handling disconnection message:", error.message);
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
      exchange: "device-connection",
    });
    console.log("Subscribed to user-connection channel.");

    await subscribe(
      process.env.SERVICE_DISCONNECTION_QUEUE,
      onDisconnectHandler,
      {
        ...options,
        exchange: "device-disconnection",
      }
    );
    console.log("Subscribed to user-disconnection channel.");
  } catch (error) {
    console.error(`Error subscribing to channels: ${error.message}`);
  }
}

// Function to handle Firebase data and check if devices are in lockout areas
async function handleFirebaseData(snapshot) {
  const locationData = snapshot.val();
  if (!locationData) {
    console.error("Received invalid data.");
    return;
  }

  try {
    // Retrieve all devices and check if they are in the lockout area of each user's workspace
    const devices = await deviceModel.list(1, 0);
    if (devices.length === 0) {
      console.log("No devices found. Skipping update.");
      return;
    }

    let updatedDevice = false; // Flag to track if a device was updated

    for (const device of devices) {
      const deviceId = device.deviceId;
      const existingDevice = await deviceModel.findByDeviceId(deviceId);

      if (existingDevice) {
        await deviceModel.addIoTDataToDevice(deviceId, {
          dataType: "location",
          location: {
            type: "Point",
            coordinates: [
              locationData.location.longitude,
              locationData.location.latitude,
            ],
          },
        });
        console.log(`Device ${deviceId} updated with new location data.`);
        updatedDevice = true; // Mark as updated
      } else {
        console.log(`Device ${deviceId} not found. Skipping update.`);
      }
    }

    // Publish only once if a device was updated
    if (updatedDevice) {
      await publish("front", "wimp-system", "device-location");
      console.log("Published device location update.");
    }
  } catch (error) {
    console.error("Error handling Firebase data:", error.message);
  }
}

// Function to listen for Firebase data updates
function listenToLocations() {
  locationsRef.on("child_added", handleFirebaseData); // Listen to new child data
  locationsRef.on("child_changed", handleFirebaseData); // Listen to changed data
  console.log("Listening for random location updates...");
}

// Function to check Firebase connection status
function checkConnection() {
  const connectedRef = db.ref(".info/connected");
  connectedRef.on("value", (snapshot) => {
    if (snapshot.val()) {
      console.log("Connected to Firebase Realtime Database.");
      listenToLocations();
    } else {
      console.log("Disconnected from Firebase Realtime Database.");
    }
  });
}

/**
 * Simulates random feeder data and pushes to Firebase.
 */
function simulateRandomFeeder() {
  setInterval(() => {
    const randomLocation = {
      latitude: (Math.random() * 180 - 90).toFixed(6), // Random latitude between -90 and 90
      longitude: (Math.random() * 360 - 180).toFixed(6), // Random longitude between -180 and 180
    };

    const randomData = {
      deviceId: "fitbit_001",
      location: randomLocation,
      timestamp: Date.now(),
    };

    locationsRef
      .child(randomData.deviceId)
      .set(randomData)
      .then(() => console.log(`Random data added:`, randomData))
      .catch((error) =>
        console.error("Error adding random data:", error.message)
      );
  }, 5000); // Push new data every 5 seconds
}

// Initialize subscriptions and start fetching
(async function initialize() {
  await startSubscriptions();
  if (process.env.RADOMN_LOCATION_FEEDER === "true") {
    simulateRandomFeeder();
  }
})();

exports.runService = () => {
  checkConnection();
};
