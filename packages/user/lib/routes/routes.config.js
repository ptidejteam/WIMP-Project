const IdentityProvider = require("./controllers/identity.provider");
const AvailabilityProvider = require("./controllers/availability.provider");

exports.routesConfig = (app) => {
  app.post("/users", [IdentityProvider.insert]);

  app.get("/users", [IdentityProvider.list]);

  app.get("/users/:userId", [IdentityProvider.getById]);

  app.put("/users/:userId", [
    // IdentityProvider.uploadAvatar, // Upload the avatar first
    IdentityProvider.putById, // Then update the user
  ]);

  app.delete("/users/:userId", [IdentityProvider.removeById]);

  // Define routes using the UserAvailabilityController
  app.post("/availability", AvailabilityProvider.insertOrUpdate);
  app.get("/availability", AvailabilityProvider.list);
  app.get("/availability/:userId", AvailabilityProvider.getById); // Retrieve user availability by ID
  app.patch("/availability", AvailabilityProvider.updateAvailability); // Update user online status
  // app.patch("/availability/tracking", AvailabilityProvider.setTrackingOption); // Update offline mode
  // app.patch("/availability", AvailabilityProvider.setAvailabilityStatus); // Update availability status
  // app.patch("/availability/message", AvailabilityProvider.setCustomMessage); // Update custom message
  // app.patch("/availability/display", AvailabilityProvider.setDisplayOption); // Update display option
  app.delete("/availability/:userId", AvailabilityProvider.removeById); // Remove availability by ID
  
};
