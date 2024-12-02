const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Function to connect to MongoDB
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
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
    deviceId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    deviceType: {
      type: String,
      required: true,
      enum: ["sensor", "actuator", "gateway", "controller", "wearable"],
    },
    lastUpdated: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    data: [
      {
        dataType: { type: String },
        value: { type: mongoose.Schema.Types.Mixed }, // Supports flexible data types
        timestamp: { type: Date, default: Date.now },
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: {
            type: [Number],
            required: false,
          },
        },
      },
    ],
  },
  { timestamps: true }
);

// Geospatial Index
deviceSchema.index({ "data.location": "2dsphere" });

// Virtual for ID
deviceSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

deviceSchema.set("toJSON", { virtuals: true });

const Device = mongoose.model("Devices", deviceSchema);

// Exported functions
exports.findByDeviceId = (deviceId) => Device.findOne({ deviceId });

exports.findById = (id) => {
  return Device.findById(id).lean().then((result) => {
    if (result) {
      delete result._id;
      delete result.__v;
    }
    return result;
  });
};

exports.findByUserId = (userId) => Device.find({ userId });

exports.createDevice = (deviceData) => new Device(deviceData).save();

exports.list = (perPage, page) =>
  Device.find()
    .limit(perPage)
    .skip(perPage * page)
    .exec();

exports.updateDevice = (id, data) =>
  Device.findByIdAndUpdate(id, data, { new: true }).exec();

exports.deleteMany = () => Device.deleteMany({});

exports.removeById = (id) => Device.findByIdAndDelete(id).exec();

exports.addIoTDataToDevice = (deviceId, newData) =>
  Device.findOneAndUpdate(
    { deviceId },
    {
      $push: { data: newData },
      $set: { lastUpdated: Date.now() },
    },
    { new: true }
  );

exports.getIoTDataForDevice = (deviceId) =>
  Device.findOne({ deviceId }, "data").lean();

exports.getIoTDataByTimeRange = (deviceId, startTime, endTime) =>
  Device.findOne(
    {
      deviceId,
      "data.timestamp": { $gte: startTime, $lte: endTime },
    },
    "data"
  );

exports.getPossibleStatusValues = () =>
  deviceSchema.path("status").enumValues || [];

exports.getPossibleDeviceTypes = () =>
  deviceSchema.path("deviceType").enumValues;
