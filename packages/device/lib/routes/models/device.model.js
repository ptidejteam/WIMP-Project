const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Function to connect to MongoDB
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      autoCreate: true,
    });
    console.log("Successfully connected to the database.");
  } catch (err) {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  }
};
connect();

// Define the Device Schema
const Schema = mongoose.Schema;

const deviceSchema = new Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      required: true,
      enum: ["sensor", "actuator", "gateway", "controller","wearable"], // Example device types
    },
    status: {
      type: String,
      enum: ["online", "offline", "maintenance"],
      default: "offline",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming there is a User model to reference the user
      required: true,
    },
    data: [
      {
        dataType: {
          type: String, // Example: temperature, humidity, etc.
          required: true,
        },
        value: {
          type: Object,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now, // Automatically set the timestamp to the current date/time
        },
        location: {
          type: {
            type: String, 
            default: "Point", // GeoJSON format for type
            enum: ["Point"], // Limit to "Point"
          },
          coordinates: {
            type: [Number], // Array of numbers [longitude, latitude]
            required: true,
          },
        },
      },
    ],
  },
  { timestamps: true }
);

// Create a 2dsphere index for geospatial queries (if needed in the future)
deviceSchema.index({ "data.location": "2dsphere" });

// Virtual field for ID
deviceSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
deviceSchema.set("toJSON", {
  virtuals: true,
});

// Custom findById function
deviceSchema.findById = function (cb) {
  return this.model("Devices").find({ id: this.id }, cb);
};

const Device = mongoose.model("Devices", deviceSchema);

// Exported functions to manage device data

// Find device by deviceId
exports.findByDeviceId = (deviceId) => {
  return Device.findOne({ deviceId: deviceId });
};

// Find device by ID and return cleaned-up data
exports.findById = (id) => {
  return Device.findById(id).then((result) => {
    result = result.toJSON();
    delete result._id;
    delete result.__v;
    return result;
  });
};

// Find all devices associated with a user
exports.findByUserId = (userId) => {
  return Device.find({ userId: userId });
};

// Create a new device
exports.createDevice = (deviceData) => {
  const device = new Device(deviceData);
  return device.save();
};

// List devices with pagination
exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Device.find()
      .limit(perPage)
      .skip(perPage * page)
      .exec()
      .then((devices) => {
        resolve(devices);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// Update device details by ID
exports.updateDevice = (id, data) => {
  return new Promise((resolve, reject) => {
    Device.findByIdAndUpdate(id, data, { new: true })
      .then((device) => {
        resolve(device);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// Remove a device by ID
exports.removeById = (id) => {
  return new Promise((resolve, reject) => {
    Device.deleteOne({ _id: id })
      .then((device) => {
        resolve(device);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// Add new IoT data to a device
exports.addIoTDataToDevice = (deviceId, newData) => {
  return Device.findOneAndUpdate(
    { deviceId: deviceId },
    { 
      $push: { data: newData }, // Add the new data object to the 'data' array
      $set: { lastUpdated: Date.now() } // Optionally update lastUpdated field
    },
    { new: true, useFindAndModify: false }
  );
};

// Retrieve all IoT data for a device
exports.getIoTDataForDevice = (deviceId) => {
  return Device.findOne({ deviceId: deviceId }, "data").lean();
};

// Retrieve data for a device within a specified time range
exports.getIoTDataByTimeRange = (deviceId, startTime, endTime) => {
  return Device.findOne(
    {
      deviceId: deviceId,
      "data.timestamp": { $gte: startTime, $lte: endTime }, // Querying nested fields
    },
    "data.$"
  );
};

// Get possible status values
exports.getPossibleStatusValues = () => {
  return deviceSchema.path('status').enumValues;
};

// Get possible deviceType values
exports.getPossibleDeviceTypes = () => {
  return deviceSchema.path('deviceType').enumValues;
};
