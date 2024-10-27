const LocationService = require("./location.service"); // Import the location service

const locationService = new LocationService();

exports.routesConfig = (app) => {
  // Endpoint to check if device is within the allowed radius
  app.get("/device/location/:deviceId", async (req, res) => {
    const deviceId = req.params.deviceId;
    try {
      const result = await locationService.checkDeviceWithinRadius(deviceId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  // Endpoint to update the target location and radius
  app.post("/device/updateLocation", (req, res) => {
    const { latitude, longitude, radiusInKm } = req.body;
    if (latitude && longitude) {
      locationService.targetLocation = { latitude, longitude };
    }
    if (radiusInKm) {
      locationService.radiusInKm = radiusInKm;
    }
    res.json({ message: "Location and radius updated successfully" });
  });
};