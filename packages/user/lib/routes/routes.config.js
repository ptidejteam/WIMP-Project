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
  app.post("/api/users/availability", AvailabilityProvider.insertOrUpdate);
  app.get("/api/users/availability", AvailabilityProvider.list);
  app.get("/api/users/availability/:userId", AvailabilityProvider.getById); // Retrieve user availability by ID
  app.patch("/api/users/availability/status", AvailabilityProvider.setUserStatus); // Update user online status
  app.patch("/api/users/availability/tracking", AvailabilityProvider.setTrackingOption); // Update offline mode
  app.patch("/api/users/availability", AvailabilityProvider.setAvailabilityStatus); // Update availability status
  app.patch("/api/users/availability/message", AvailabilityProvider.setCustomMessage); // Update custom message
  app.patch("/api/users/availability/display", AvailabilityProvider.setDisplayOption); // Update display option
  app.delete("/api/users/availability/:userId", AvailabilityProvider.removeById); // Remove availability by ID
  
};
