const IdentityProvider = require("./controllers/identity.provider");
const AvailabilityProvider = require("./controllers/availability.provider");

exports.routesConfig = (app) => {
  app.post("/users", [IdentityProvider.insert]);

  app.get("/users", [IdentityProvider.list]);

  app.get("/users/:userId", [IdentityProvider.getById]);

  app.put("/users/:userId", [
    IdentityProvider.uploadAvatar, // Upload the avatar first
    IdentityProvider.putById, // Then update the user
  ]);

  app.delete("/users/:userId", [IdentityProvider.removeById]);

  // Define routes using the UserAvailabilityController
  app.post("/api/users/availability", AvailabilityProvider.insertOrUpdate);
  app.post("/api/users/setUserStatus", AvailabilityProvider.setUserStatus);
  app.post("/api/users/setTrackingOption", AvailabilityProvider.setTrackingOption);
  app.post(
    "/api/users/setAvailabilityStatus",
    AvailabilityProvider.setAvailabilityStatus
  );
  app.post("/api/users/setCustomMessage", AvailabilityProvider.setCustomMessage);
  app.post("/api/users/setDisplayOption", AvailabilityProvider.setDisplayOption);
  app.delete(
    "/api/users/removeAvailability/:userId",
    AvailabilityProvider.removeById
  );
};
