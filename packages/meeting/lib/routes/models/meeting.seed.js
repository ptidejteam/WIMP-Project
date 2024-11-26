const MeetingModel = require("./meeting.model");
const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

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
    console.error(`Failed to connect to the database:${err}`);
    process.exit(1);
  }
};

// Seed the database conditionally
const seedDatabase = async () => {
  try {
    // Seed data
    const seedMeetings = [];

    await MeetingModel.deleteMany({});
    console.log("Existing meetings cleared.");

    for (const meetingData of seedMeetings) {
      await MeetingModel.create(meetingData);
    }
    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding the database:", error);
  }
};

// Main function to run the script
exports.runSeed = async () => {
  await connect();
  await seedDatabase();
};
