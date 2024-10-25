const AvailabilityModel = require("../models/availability.model");

exports.list = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const page = Math.max(parseInt(req.query.page) || 0, 0);

    const result = await AvailabilityModel.list(limit, page);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error listing user availability records:", error);
    res.status(500).send({ message: "Internal Server Error. Could not retrieve user availability list." });
  }
};

// Insert or find user availability
exports.insertOrUpdate = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).send({ message: "User ID is required." });
    }

    const result = await AvailabilityModel.findOrCreate(userId);
    res.status(201).send({ id: result._id });
  } catch (error) {
    console.error("Error inserting or updating user availability:", error);
    res.status(500).send({ message: "Internal Server Error. Could not insert or update user availability." });
  }
};

// Update user status
exports.setUserStatus = async (req, res) => {
  try {
    const { userId, isOnline } = req.body;
    const result = await AvailabilityModel.updateById(userId, { isOnline });
    if (!result) {
      return res.status(404).send({ message: "User availability not found." });
    }
    res.status(200).send({ message: "User status updated successfully.", settings: result });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).send({ message: "Internal Server Error. Could not update user status." });
  }
};

// Update offline mode
exports.setTrackingOption = async (req, res) => {
  try {
    const { userId, allowOfflineMode } = req.body;
    const result = await AvailabilityModel.updateById(userId, { allowOfflineMode });
    if (!result) {
      return res.status(404).send({ message: "User availability not found." });
    }
    res.status(200).send({ message: "Offline mode updated successfully.", settings: result });
  } catch (error) {
    console.error("Error updating offline mode:", error);
    res.status(500).send({ message: "Internal Server Error. Could not update offline mode." });
  }
};

// Update availability status
exports.setAvailabilityStatus = async (req, res) => {
  try {
    const { userId, availabilityStatus } = req.body;
    const result = await AvailabilityModel.updateById(userId, { availabilityStatus });
    if (!result) {
      return res.status(404).send({ message: "User availability not found." });
    }
    res.status(200).send({ message: "Availability status updated successfully.", settings: result });
  } catch (error) {
    console.error("Error updating availability status:", error);
    res.status(500).send({ message: "Internal Server Error. Could not update availability status." });
  }
};

// Update custom message
exports.setCustomMessage = async (req, res) => {
  try {
    const { userId, customMessage } = req.body;
    const result = await AvailabilityModel.updateById(userId, { customMessage });
    if (!result) {
      return res.status(404).send({ message: "User availability not found." });
    }
    res.status(200).send({ message: "Custom message updated successfully.", settings: result });
  } catch (error) {
    console.error("Error updating custom message:", error);
    res.status(500).send({ message: "Internal Server Error. Could not update custom message." });
  }
};

// Update display option
exports.setDisplayOption = async (req, res) => {
  try {
    const { userId, displayToOthers } = req.body;
    const result = await AvailabilityModel.updateById(userId, { displayToOthers });
    if (!result) {
      return res.status(404).send({ message: "User availability not found." });
    }
    res.status(200).send({ message: "Display option updated successfully.", settings: result });
  } catch (error) {
    console.error("Error updating display option:", error);
    res.status(500).send({ message: "Internal Server Error. Could not update display option." });
  }
};

// Get user availability by ID
exports.getById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await AvailabilityModel.getById(userId);
    if (!result) {
      return res.status(404).send({ message: "User availability not found." });
    }
    res.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving user availability by ID:", error);
    res.status(500).send({ message: "Internal Server Error. Could not retrieve user availability." });
  }
};

// Remove user availability by user ID
exports.removeById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await AvailabilityModel.removeById(userId);
    if (!result.deletedCount) {
      return res.status(404).send({ message: "User availability not found." });
    }
    res.status(204).send(); // No content response
  } catch (error) {
    console.error("Error removing user availability by ID:", error);
    res.status(500).send({ message: "Internal Server Error. Could not remove user availability." });
  }
};
