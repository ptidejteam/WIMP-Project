const deviceModel = require("../routes/models/device.model");
// Haversine formula to calculate distance (in meters)
exports.calculateDistance = function (lat1, lon1, lat2, lon2) {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const R = 6371 * 1000; // Earth's radius in meters

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

// Function to check if a device is within the lockout area of a workspace
exports.isDeviceInLockoutArea = function (
  deviceLocation,
  workspaceLocation,
  lockoutRadiusInMeters
) {
  const { latitude: deviceLat, longitude: deviceLon } = deviceLocation;
  const { latitude: workspaceLat, longitude: workspaceLon } = workspaceLocation;

  const distance = calculateDistance(
    deviceLat,
    deviceLon,
    workspaceLat,
    workspaceLon
  );
  return distance <= lockoutRadiusInMeters;
};


// exports.IsInLockoutArea = function(){
//     try {


//     } catch {

//     }

// }
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

          if (
            isDeviceInLockoutArea(
              deviceLocation,
              workspaceLocation,
              lockoutRadius
            )
          ) {
            console.log(
              `Device ${deviceId} is in the lockout area of workspace ${workspace.id} for user ${userId}.`
            );
            // Take action (e.g., send a notification or log the event)
          } else {
            console.log(
              `Device ${deviceId} is outside the lockout area of workspace ${workspace.id} for user ${userId}.`
            );
          }
        });
      });
    });
  } catch (error) {
    console.error("Error checking devices in lockout area:", error.message);
  }
}
