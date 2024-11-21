const AvailabilityModel = require("../models/availability.model");
const { publish } = require("@wimp-project/rabbitmq");

exports.list = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const page = Math.max(parseInt(req.query.page) || 0, 0);

    const result = await AvailabilityModel.list(limit, page);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error listing user availability records:", error);
    res.status(500).send({
      message:
        "Internal Server Error. Could not retrieve user availability list.",
    });
  }
};

exports.insertOrUpdate = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).send({ message: "User ID is required." });
    }

    const result = await AvailabilityModel.findOrCreate(userId);
    // Notify the front about the changes of the Availability
    publish("front", "wimp-system", userId)
      .then(() => console.log("Front Notification sent"))
      .catch((err) => console.error(err));

    // Return the information to the front
    res.status(201).send({ id: result._id });
  } catch (error) {
    console.error("Error inserting or updating user availability:", error);
    res.status(500).send({
      message:
        "Internal Server Error. Could not insert or update user availability.",
    });
  }
};

// Unified update function
exports.updateAvailability = async (req, res) => {
  try {
    const { userId, ...updates } = req.body;
    if (!userId) {
      return res.status(400).send({ message: "User ID is required." });
    }

    // Check for empty updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).send({ message: "No update fields provided." });
    }
    const result = await AvailabilityModel.updateById(userId, updates);

    if (!result) {
      return res.status(404).send({ message: "User availability not found." });
    }
    res.status(200).send({
      message: "User availability updated successfully.",
      settings: result,
    });
    // Notify the front about the changes of the Availability
    publish("front", "wimp-system", "userId")
      .then(() => console.log("Front Notification sent"))
      .catch((err) => console.error(err));
  } catch (error) {
    console.error("Error updating user availability:", error);
    res.status(500).send({
      message:
        "Internal Server Error. Could not update user availability : " +
        error.message,
    });
  }
};

exports.updateDefaultMessage = async (req, res) => {
  try {
    const { defaultMessages } = req.body;

    // Check if defaultMessages is provided and is an array
    if (!defaultMessages || !Array.isArray(defaultMessages)) {
      return res.status(400).send({
        message:
          "defaultMessages should be provided as an array in the request body.",
      });
    }

    // Perform the update operation
    const result = await AvailabilityModel.updateDefaultMessages(
      defaultMessages
    );

    // Check if the update result indicates success
    if (result.matchedCount === 0) {
      return res.status(406).send({
        message:
          "The update could not be performed correctly. No records matched.",
      });
    }

    // Send a success response
    res.status(200).send({
      message: "Users' default messages have been updated successfully.",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    // Handle server errors
    res.status(500).send({
      message: "An error occurred while updating the default messages.",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await AvailabilityModel.getById(userId);
    if (!result) {
      return res.status(404).send({ message: "User availability not found." });
    }
    res.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving user availability by ID:", error);
    res.status(500).send({
      message: "Internal Server Error. Could not retrieve user availability.",
    });
  }
};

exports.removeById = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await AvailabilityModel.removeById(userId);
    if (!result || !result.deletedCount) {
      return res.status(404).send({ message: "User availability not found." });
    }
    res.status(204).send(); // No content response
  } catch (error) {
    console.error("Error removing user availability by ID:", error);
    res.status(500).send({
      message: "Internal Server Error. Could not remove user availability.",
    });
  }
};
