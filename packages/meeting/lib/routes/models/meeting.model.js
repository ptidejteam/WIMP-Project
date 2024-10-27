const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Database connection
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

// Schema definition
const Schema = mongoose.Schema;

const meetingSchema = new Schema(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    requestedUserId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    time: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'rejected'], 
      default: 'pending' 
    },
  },
  { timestamps: true }
);

// Virtual ID field
meetingSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
meetingSchema.set("toJSON", { virtuals: true });

// Static method for finding by ID
meetingSchema.statics.findByIdCustom = function (id) {
  return this.findOne({ _id: id }).lean().exec();
};

// Model
const Meeting = mongoose.model("Meetings", meetingSchema);

// Methods

// Find meetings by requester ID
exports.findByRequesterId = (requesterId) => 
  Meeting.find({ requesterId }).lean().exec();

// Find a specific meeting by ID
exports.findById = async (id) => {
  const result = await Meeting.findByIdCustom(id);
  if (result) {
    delete result._id;
    delete result.__v;
  }
  return result;
};

// Create a new meeting
exports.createMeeting = async (meetingData) => {
  const meeting = new Meeting(meetingData);
  await meeting.save();
  return meeting;
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
  Meeting.findByIdAndUpdate(id, data, { new: true }).lean().exec();

// Delete a meeting by ID
exports.removeById = (id) => Meeting.deleteOne({ _id: id }).exec();

// Seed data
const seedMeetings = [
  {
    requesterId: "601d1e5f9e2a7e3f4453f8bc", // Sample requester ID
    requestedUserId: "601d1e5f9e2a7e3f4453f8bd", // Sample requested user ID
    time: new Date(),
    status: 'confirmed'
  },
];

// Seed the database conditionally
const seedDatabase = async () => {
  try {
    await Meeting.deleteMany({});
    console.log("Existing meetings cleared.");

    for (const meetingData of seedMeetings) {
      await exports.createMeeting(meetingData);
    }
    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding the database:", error);
  }
};

// Conditionally seed the database if SEED_DB is set to true
if (process.env.SEED_DB === "true") {
  seedDatabase();
}
