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
    // await DeviceModel.deleteMany({});

    // Sample device data
    const devices = [
      {
        deviceId: "device_001",
        name: "Temperature Sensor",
        deviceType: "sensor",
        status: "online",
        userId: "64d0f68c5135f66f46069f8b", // Replace with actual User ID
        data: [
          {
            dataType: "temperature",
            value: { value: 22, unit: "C" },
            timestamp: new Date(),
            location: {
              type: "Point",
              coordinates: [-74.005974, 40.712776], // [longitude, latitude]
            },
          },
        ],
      },
      {
        deviceId: "device_002",
        name: "Humidity Sensor",
        deviceType: "sensor",
        status: "offline",
        userId: "64d0f68c5135f66f46069f8b", // Replace with actual User ID
        data: [
          {
            dataType: "humidity",
            value: { value: 60, unit: "%" },
            timestamp: new Date(),
            location: {
              type: "Point",
              coordinates: [-74.005974, 40.712776], // [longitude, latitude]
            },
          },
        ],
      },
      {
        deviceId: "device_003",
        name: "Gateway Device",
        deviceType: "gateway",
        status: "maintenance",
        userId: "64d0f68c5135f66f46069f8b", // Replace with actual User ID
      },
    ];

    // Insert devices into the database
   devices.forEach(async (element) => {
    await DeviceModel.createDevice(element);

   });
    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    //mongoose.connection.close();
  }
};

// Main function to run the script
const main = async () => {
  await connect();
  await seedDatabase();
};

// Execute the script
main();
