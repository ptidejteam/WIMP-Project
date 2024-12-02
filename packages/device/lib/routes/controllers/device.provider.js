const DeviceModel = require("../models/device.model");

// Insert a new device
exports.insert = async (req, res) => {
  try {
    const result = await DeviceModel.createDevice(req.body);
    res.status(201).send({ id: result._id });
  } catch (error) {
    console.error("Error inserting device:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// List devices with pagination
exports.list = async (req, res) => {
  try {
    const limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    const page = req.query.page && Number.isInteger(parseInt(req.query.page)) ? parseInt(req.query.page) : 0;

    const result = await DeviceModel.list(limit, page);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error listing devices:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Get device by ID
exports.getById = async (req, res) => {
  try {
    const result = await DeviceModel.findById(req.params.deviceId);
    if (!result) {
      return res.status(404).send({ message: "Device not found" });
    }
    res.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving device by ID:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Update device by ID
exports.putById = async (req, res) => {
  try {
    const result = await DeviceModel.updateDevice(req.params.deviceId, req.body);
    if (!result) {
      return res.status(404).send({ message: "Device not found" });
    }
    res.status(204).send({});
  } catch (error) {
    console.error("Error updating device by ID:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Remove device by ID
exports.removeById = async (req, res) => {
  try {
    const result = await DeviceModel.removeById(req.params.deviceId);
    if (!result) {
      return res.status(404).send({ message: "Device not found" });
    }
    res.status(204).send({});
  } catch (error) {
    console.error("Error removing device by ID:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Find devices by user ID
exports.getByUserId = async (req, res) => {
  try {
    const result = await DeviceModel.findByUserId(req.params.userId);
    if (!result || result.length === 0) {
      return res.status(404).send({ message: "No devices found for the user" });
    }
    res.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving devices by user ID:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Add IoT data to a device
exports.addIoTData = async (req, res) => {
  try {
    const newData = {
      dataType: req.body.dataType,
      value: req.body.value,
      timestamp: req.body.timestamp || Date.now(),
    };
    
    const result = await DeviceModel.addIoTDataToDevice(req.params.deviceId, newData);
    
    if (!result) {
      return res.status(404).send({ message: "Device not found" });
    }

    res.status(200).send(result);
  } catch (error) {
    console.error("Error adding IoT data:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Retrieve IoT data for a device
exports.getIoTData = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;

    let result;
    if (startTime && endTime) {
      result = await DeviceModel.getIoTDataByTimeRange(
        req.params.deviceId,
        new Date(startTime),
        new Date(endTime)
      );
    } else {
      console.log("getting without range");
      result = await DeviceModel.getIoTDataByTimeRange(req.params.deviceId);
    }

    if (!result) {
      return res.status(404).send({ message: "Device or data not found" });
    }

    res.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving IoT data:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
