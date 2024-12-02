const MeetingModel = require("../models/meeting.model");
const {  publish } = require("@wimp-project/rabbitmq");

// List all meetings with pagination
exports.list = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const page = Math.max(parseInt(req.query.page) || 0, 0);

    const result = await MeetingModel.list(limit, page);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error listing meetings:", error);
    res.status(500).send({ message: "Internal Server Error. Could not retrieve meetings list." });
  }
};

// Insert a new meeting
exports.insert = async (req, res) => {
  try {
    const { requesterId, requestedUserId } = req.body;

    if (!requesterId || !requestedUserId) {
      return res.status(400).send({ message: "Requester ID, Requested User ID, and Time are required." });
    }
    const result = await MeetingModel.create(req.body);
    await publish("front","wimp-system","meeting-request");
    await publish("front","wimp-system","meeting");
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error. Could not insert meeting." + error });
  }
};

// Update meeting by ID
exports.updateById = async (req, res) => {
  try {
    const { _id, ...updates } = req.body;
    if (!_id) {
      return res.status(400).send({ message: "Meeting ID is required." });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).send({ message: "No update fields provided." });
    }

    const result = await MeetingModel.updateById(_id, updates);
    if (!result) {
      return res.status(404).send({ message: "Meeting not found." });
    }
    await publish("front","wimp-system","meeting-request");
    await publish("front","wimp-system","meeting");
    res.status(200).send({ message: "Meeting updated successfully.", meeting: result });
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(500).send({ message: "Internal Server Error. Could not update meeting." });
  }
};

// Get meeting by ID
exports.getById = async (req, res) => {
  try {
    const result = await MeetingModel.findByRequesterOrRequestedUserId(req.params.userId);
    if (!result) {
      return res.status(404).send({ message: "Meeting not found." });
    }
    res.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving meeting by ID:", error);
    res.status(500).send({ message: "Internal Server Error. Could not retrieve meeting." });
  }
};

// Remove meeting by ID
exports.removeById = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const result = await MeetingModel.removeById(meetingId);
    if (!result || !result.deletedCount) {
      return res.status(404).send({ message: "Meeting not found." });
    }
    res.status(204).send(); // No content response
    await publish("front","wimp-system","meeting-request");
    await publish("front","wimp-system","meeting");
  } catch (error) {
    console.error("Error removing meeting by ID:", error);
    res.status(500).send({ message: "Internal Server Error. Could not remove meeting." });
  }
};
