const mongoose = require('mongoose');
const haversine = require('haversine');
const DeviceModel = require('../routes/models/device.model'); // Import your device model

class LocationService {
  constructor(pollingInterval = 5000) { // Poll every 5 seconds by default
    this.targetLocation = {
      latitude: 40.712776, // Example latitude for target location
      longitude: -74.005974 // Example longitude for target location
    };
    this.radiusInKm = 10; // Allowed radius in kilometers
    this.pollingInterval = pollingInterval; // Polling frequency in milliseconds
  }

  /**
   * Check if the device's location is within the allowed radius
   * @param {Object} deviceLocation - Object containing latitude and longitude of the device
   * @returns {boolean} - True if the device is within the radius, false otherwise
   */
  isDeviceWithinRadius(deviceLocation) {
    const distance = haversine(this.targetLocation, deviceLocation, { unit: 'km' });
    console.log(`Distance to target: ${distance} km`);
    return distance <= this.radiusInKm;
  }

    /**
   * Get the device location and check if it is within the allowed radius
   * @param {String} deviceId - The ID of the device to check
   * @returns {Object} - Contains device location and whether it is within the radius
   */
    async checkDeviceWithinRadius(deviceId) {
      try {
        const deviceData = await DeviceModel.getIoTDataForDevice(deviceId);
  
        if (deviceData && deviceData.data.length > 0) {
          const latestData = deviceData.data[deviceData.data.length - 1]; // Latest entry
          const deviceLocation = {
            latitude: latestData.location.coordinates[1], // [longitude, latitude]
            longitude: latestData.location.coordinates[0]
          };
  
          const isWithinRadius = this.isDeviceWithinRadius(deviceLocation);
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
   * Poll the database for the latest IoT data and monitor the device location
   * @param {String} deviceId - The ID of the device to monitor
   */
  async monitorDevice(deviceId) {
    setInterval(async () => {
      try {
        const deviceData = await DeviceModel.getIoTDataForDevice(deviceId);

        if (deviceData && deviceData.data.length > 0) {
          const latestData = deviceData.data[deviceData.data.length - 1]; // Latest entry
          const deviceLocation = {
            latitude: latestData.location.coordinates[1], // [longitude, latitude]
            longitude: latestData.location.coordinates[0]
          };

          if (this.isDeviceWithinRadius(deviceLocation)) {
            console.log(`Device ${deviceId} is within the allowed radius.`);
          } else {
            console.log(`Device ${deviceId} is out of the allowed radius!`);
            // You can trigger any real-time alert or notification here
          }
        } else {
          console.log(`No location data found for device ${deviceId}`);
        }
      } catch (error) {
        console.error(`Error during monitoring of device ${deviceId}:`, error);
      }
    }, this.pollingInterval);
  }
}

module.exports = LocationService;
