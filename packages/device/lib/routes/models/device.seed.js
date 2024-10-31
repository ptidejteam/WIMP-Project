const mongoose = require("mongoose"); 
const path = require("path");
const DeviceModel = require("./device.model"); // Adjust the path as necessary
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

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Clear the existing devices
   // await DeviceModel.deleteMany({}); // Deletes all devices in the collection

    // Only add the Fitbit device
    const fitbitDevice = {
      deviceId: "fitbit_001",
      name: "Fitbit Device",
      deviceType: "wearable",
      status: "online",
      userId: "64d0f68c5135f66f46069f8b", // Replace with actual User ID
      data: [
        {
          dataType: "heart_rate",
          value: { value: 75, unit: "bpm" },
          timestamp: new Date(),
          location: {
            type: "Point",
            coordinates: [-74.005974, 40.712776], // [longitude, latitude]
          },
        },
        {
          dataType: "steps",
          value: { value: 5000, unit: "steps" },
          timestamp: new Date(),
          location: {
            type: "Point",
            coordinates: [-74.005974, 40.712776], // [longitude, latitude]
          },
        },
      ],
    };

    // Insert the Fitbit device into the database
    await DeviceModel.createDevice(fitbitDevice);
    console.log("Fitbit device seeded successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.connection.close(); // Ensure the connection is closed
  }
};

// Main function to run the script
const main = async () => {
  await connect();
  await seedDatabase();
};

// Execute the script
main();
