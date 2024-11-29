const MeetingModel = require("../routes/models/meeting.model");

// Middleware to validate fields and check for overlapping meetings
exports.checkOverlapedMeeting = async (req, res, next) => {
  const errors = [];

  // Validate presence of required fields
  const { requesterId, requestedUserId, start, end } = req.body;

  if (!requesterId) errors.push("Missing requesterId field");
  if (!requestedUserId) errors.push("Missing requestedUserId field");
  if (!start) errors.push("Missing start field");
  if (!end) errors.push("Missing end field");

  if (errors.length) {
    return res.status(400).send({ errors: errors.join(", ") });
  }

  try {
    // Check for overlapping meetings
    const overlap = await MeetingModel.findOverlap({ requesterId, requestedUserId, start, end });

    if (overlap) {
      return res.status(409).send({ errors: "Overlapping meeting found" });
    }

    next(); // Proceed to the next middleware/handler if no conflicts
  } catch (error) {
    console.error("Error checking overlap:", error);
    res.status(500).send({ errors: "Internal server error" });
  }
};
