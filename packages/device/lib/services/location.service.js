const DeviceModel = require('../routes/models/device.model'); // Import your device model
const cron = require('node-cron'); // Import node-cron
const haversine = require('haversine');

// Configuration
const targetLocation = {
  latitude: 40.712776, // Example latitude for target location
  longitude: -74.005974 // Example longitude for target location
};
const radiusInKm = 10; // Allowed radius in kilometers
const pollingInterval = 5000; // Polling frequency in milliseconds

/**
 * Check if the device's location is within the allowed radius
 * @param {Object} deviceLocation - Object containing latitude and longitude of the device
 * @returns {boolean} - True if the device is within the radius, false otherwise
 */
function isDeviceWithinRadius(deviceLocation) {
  const distance = haversine(targetLocation, deviceLocation, { unit: 'km' });
  console.log(`Distance to target: ${distance} km`);
  return distance <= radiusInKm;
}

/**
 * Get the device location and check if it is within the allowed radius
 * @param {String} deviceId - The ID of the device to check
 * @returns {Object} - Contains device location and whether it is within the radius
 */
async function checkDeviceWithinRadius(deviceId) {
  try {
    const deviceData = await DeviceModel.getIoTDataForDevice(deviceId);

    if (deviceData && deviceData.data.length > 0) {
      const latestData = deviceData.data[deviceData.data.length - 1]; // Latest entry
      const deviceLocation = {
        latitude: latestData.location.coordinates[1], // [longitude, latitude]
        longitude: latestData.location.coordinates[0]
      };

      const isWithinRadius = isDeviceWithinRadius(deviceLocation);
      await saveDeviceData(deviceId, deviceLocation, isWithinRadius);
      return { deviceLocation, isWithinRadius };
    } else {
      throw new Error(`No location data found for device ${deviceId}`);
    }
  } catch (error) {
    console.error(`Error checking device ${deviceId}:`, error);
    throw error;
  }
}

/**
 * Save device data to the database
 * @param {String} deviceId - The ID of the device
 * @param {Object} deviceLocation - The location of the device
 * @param {boolean} isWithinRadius - Whether the device is within the radius
 */
async function saveDeviceData(deviceId, deviceLocation, isWithinRadius) {
  try {
    // Implement the logic to save or update the device location in the database
    await DeviceModel.updateDeviceLocation(deviceId, deviceLocation, isWithinRadius);
    console.log(`Saved location data for device ${deviceId}.`);
  } catch (error) {
    console.error(`Error saving device data for ${deviceId}:`, error);
  }
}

/**
 * Monitor the device location using a cron job
 */
function listenToDeviceLocation() {
  // Schedule to run every `pollingInterval` milliseconds
  cron.schedule(`*/${pollingInterval / 1000} * * * * *`, async () => {
    try {
      const devices = await DeviceModel.list(); // Assuming this retrieves a list of devices

      for (const device of devices) {
        console.log(`Checking location for device ${device._id}...`);
        await checkDeviceWithinRadius(device._id);
      }
    } catch (error) {
      console.error(`Error during device location monitoring:`, error);
    }
  });
}


module.exports = { listenToDeviceLocation ,checkDeviceWithinRadius,isDeviceWithinRadius }; // Export the function if needed
