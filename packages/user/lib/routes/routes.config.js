const IdentityProvider = require("./controllers/identity.provider");
const AvailabilityProvider = require("./controllers/availability.provider");

exports.routesConfig = (app) => {
  app.post("/users", [IdentityProvider.insert]);
  app.get("/users", [IdentityProvider.list]);
  app.get("/users/:userId", [IdentityProvider.getById]);
  app.put("/users/:userId", [
    IdentityProvider.putById, // Then update the user
  ]);
  app.delete("/users/:userId", [IdentityProvider.removeById]);
  app.put("/users/:userId/privacy",[IdentityProvider.updatePrivacy])
  // Define routes using the UserAvailabilityController
  app.post("/availability", [AvailabilityProvider.insertOrUpdate]);
  app.get("/availability", [AvailabilityProvider.list]);
  app.get("/availability/:userId", [AvailabilityProvider.getById]); // Retrieve user availability by ID
  app.patch("/availability", [AvailabilityProvider.updateAvailability]); // Update user online status
  app.delete("/availability/:userId", [AvailabilityProvider.removeById]); // Remove availability by ID
};
