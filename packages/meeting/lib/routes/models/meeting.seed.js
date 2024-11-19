const MeetingModel = require("./meeting.model");


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