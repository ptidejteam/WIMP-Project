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
  },
  { timestamps: true }
);

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
