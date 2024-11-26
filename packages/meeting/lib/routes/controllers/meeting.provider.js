const MeetingModel = require("../models/meeting.model");

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
    const { requesterId, requestedUserId, time } = req.body;

    if (!requesterId || !requestedUserId || !time) {
      return res.status(400).send({ message: "Requester ID, Requested User ID, and Time are required." });
    }

    const meetingData = { requesterId, requestedUserId, time };
    const result = await MeetingModel.create(meetingData);
    res.status(201).send({ id: result._id });
  } catch (error) {
    console.error("Error inserting meeting:", error);
    res.status(500).send({ message: "Internal Server Error. Could not insert meeting." });
  }
};

// Update meeting by ID
exports.updateById = async (req, res) => {
  try {
    const { meetingId, ...updates } = req.body;
    if (!meetingId) {
      return res.status(400).send({ message: "Meeting ID is required." });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).send({ message: "No update fields provided." });
    }

    const result = await MeetingModel.updateById(meetingId, updates);
    if (!result) {
      return res.status(404).send({ message: "Meeting not found." });
    }
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
  } catch (error) {
    console.error("Error removing meeting by ID:", error);
    res.status(500).send({ message: "Internal Server Error. Could not remove meeting." });
  }
};
