const MeetingProvider = require("./controllers/meeting.provider");
const axios = require("axios");
const USER_URL = process.env.USER_URL;

// Middleware to check user availability
const checkUserAvailability = async (req, res, next) => {
  const { userId } = req.body; // Assume userId is passed in the request body for creating a meeting

  if (!userId) {
    return res.status(400).send({ message: "User ID is required." });
  }

  try {
    // Replace the URL with your actual availability service endpoint
    const response = await axios.get(`${USER_URL}/availability/${userId}`);

    if (response.data && response.data.isAvailable) {
      next(); // User is available, proceed to the next middleware/controller
    } else {
      return res.status(400).send({ message: "User is not available." });
    }
  } catch (error) {
    console.error("Error checking user availability:", error);
    return res
      .status(500)
      .send({
        message: "Internal Server Error. Could not check user availability.",
      });
  }
};

exports.routesConfig = (app) => {
  // Meeting routes
  app.post("/meetings", [MeetingProvider.insert]); // Create a new meeting with availability check
  app.get("/meetings", [MeetingProvider.list]); // List all meetings with pagination
  app.get("/meetings/:meetingId", [MeetingProvider.getById]); // Retrieve a meeting by ID
  app.patch("/meetings", [MeetingProvider.updateById]); // Update a meeting by ID
  app.delete("/meetings/:meetingId", [MeetingProvider.removeById]); // Remove a meeting by ID
};
