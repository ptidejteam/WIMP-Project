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
    const data = JSON.parse(message.content.toString());
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

    await subscribe(process.env.SERVICE_DISCONNECTION_QUEUE, onDisconnectHandler, {
      ...options,
      exchange: "device-disconnection",
    });
    console.log("Subscribed to user-disconnection channel.");
  } catch (error) {
    console.error(`Error subscribing to channels: ${error.message}`);
  }
}

// Haversine formula to calculate distance (in meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const R = 6371 * 1000; // Earth's radius in meters

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

// Function to check if a device is within the lockout area of a workspace
function isDeviceInLockoutArea(deviceLocation, workspaceLocation, lockoutRadiusInMeters) {
  const { latitude: deviceLat, longitude: deviceLon } = deviceLocation;
  const { latitude: workspaceLat, longitude: workspaceLon } = workspaceLocation;

  const distance = calculateDistance(deviceLat, deviceLon, workspaceLat, workspaceLon);
  return distance <= lockoutRadiusInMeters;
}

// Function to check each user's workspaces for lockout area violation
async function checkDevicesInLockoutArea() {
  try {
    // Retrieve all devices from your model or database
    const devices = await deviceModel.list(1, 0); // Adjust the parameters as needed

    if (devices.length === 0) {
      console.log("No devices found. Skipping lockout area check.");
      return;
    }

    // Iterate over all devices and check if they are within the lockout area of each user's workspaces
    devices.forEach(async (device) => {
      const deviceId = device.deviceId;
      const deviceLocation = device.location; // Assuming location is stored in device data

      if (!deviceLocation) {
        console.log(`Device ${deviceId} has no location data. Skipping.`);
        return;
      }

      // Check if the device is in the lockout area of any user's workspaces
      userWorkSpaces.forEach((workspaces, userId) => {
        workspaces.forEach((workspace) => {
          const workspaceLocation = workspace.location; // Assuming workspace includes location
          const lockoutRadius = workspace.lockoutRadius || 100; // Default to 100 meters if no lockout radius is provided

          if (isDeviceInLockoutArea(deviceLocation, workspaceLocation, lockoutRadius)) {
            console.log(`Device ${deviceId} is in the lockout area of workspace ${workspace.id} for user ${userId}.`);
            // Take action (e.g., send a notification or log the event)
          } else {
            console.log(`Device ${deviceId} is outside the lockout area of workspace ${workspace.id} for user ${userId}.`);
          }
        });
      });
    });
  } catch (error) {
    console.error("Error checking devices in lockout area:", error.message);
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
    await checkDevicesInLockoutArea();

    // You can also update the device location in your database, for example:
    const devices = await deviceModel.list(1, 0);
    if (devices.length === 0) {
      console.log("No devices found. Skipping update.");
      return;
    }

    const deviceId = devices[0].deviceId;
    const existingDevice = await deviceModel.findByDeviceId(deviceId);

    if (existingDevice) {
      await deviceModel.addIoTDataToDevice(deviceId, {
        dataType: "location",
        location: {
          type: "Point",
          coordinates: [locationData.longitude, locationData.latitude],
        },
      });
      console.log(`Device ${deviceId} updated with new location data.`);
    } else {
      console.log(`Device ${deviceId} not found. Skipping update.`);
    }
  } catch (error) {
    console.error("Error handling Firebase data:", error.message);
  }
}

// Function to listen for Firebase data updates
function listenToRandomLocations() {
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
      listenToRandomLocations();
    } else {
      console.log("Disconnected from Firebase Realtime Database.");
    }
  });
}

// Initialize subscriptions and start fetching
(async function initialize() {
  await startSubscriptions();
})();

exports.runService = () => {
  checkConnection();
};
