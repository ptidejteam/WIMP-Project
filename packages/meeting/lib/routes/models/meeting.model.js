const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Database connection
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("Successfully connected to the database.");
  } catch (err) {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  }
};
connect();

// Schema definition
const Schema = mongoose.Schema;

const meetingSchema = new Schema(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: "Users" },
    requestedUserId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    eventId: { type: String, required: true },
    source: {
      type: String,
      enum: ["internal", "external"],
      default: "internal",
    },
    summary: { type: String },
    description: { type: String },
    start: { type: Date },
    end: { type: Date },
    location: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Ensure virtual fields are serialized
meetingSchema.set("toJSON", { virtuals: true });

// Pre-save hook to auto-generate eventId for internal meetings
meetingSchema.pre("save", function (next) {
  if (this.source === "internal" && !this.eventId) {
    this.eventId = `${new mongoose.Types.ObjectId().toHexString()}`;
  }
  next();
});

// Model
const Meeting = mongoose.model("Meetings", meetingSchema);

// Methods

// Find meetings by requester ID
exports.findByRequesterId = (requesterId) =>
  Meeting.find({ requesterId }).lean().exec();

// Find meetings by requester or requested user ID
exports.findByRequesterOrRequestedUserId = (userId) =>
  Meeting.find({ $or: [{ requesterId: userId }, { requestedUserId: userId }] })
    .lean()
    .exec();

exports.findByEventId = (eventId) => Meeting.find({ eventId }).lean().exec();

// Create a new meeting
exports.createMeeting = async (meetingData) => {
  const meeting = new Meeting(meetingData);
  return meeting.save();
};

// List all meetings with pagination
exports.list = (perPage = 10, page = 0) =>
  Meeting.find()
    .limit(perPage)
    .skip(perPage * page)
    .lean()
    .exec();

// Update meeting status by ID
exports.updateById = (id, data) =>
  Meeting.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .lean()
    .exec();

// Delete a meeting by ID
exports.removeById = (id) => Meeting.deleteOne({ eventId : id }).exec();

// Delete all meetings
exports.deleteMany = (filter = {}) => Meeting.deleteMany(filter).exec();


// Use the pre-defined UpdateOne 
exports.updateOne = (data) => Meeting.updateOne(data).exec();
