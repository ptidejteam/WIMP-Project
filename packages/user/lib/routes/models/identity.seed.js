const mongoose = require("mongoose");
const path = require("path");
const Identity = require("./identity.model"); // Adjust the path as necessary
const { hashPassword } = require("@wimp-project/utils");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const role = require("../../security/env.config");

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

// Function to seed the database with multiple users
const seedDatabase = async () => {
  try {
    // Clear the existing identities
    await Identity.deleteMany();
    console.log("Existing identities cleared.");

    // Array of user seed data
    const seedIdentities = [
      {
        firstName: "Admin",
        lastName: "Admin",
        userName: "admin_user",
        email: "admin@example.com",
        birthday: new Date(),
        password: hashPassword("admin_password"),
        workSpaces: [
          {
            id: 1,
            name: "Workspace A",
            coordinates: { lat: 40.7128, lng: -74.006 },
            lookoutDiameter: 500,
          },
          {
            id: 2,
            name: "Workspace B",
            coordinates: { lat: 34.0522, lng: -118.2437 },
            lookoutDiameter: 300,
          },
          {
            id: 3,
            name: "Workspace C",
            coordinates: { lat: 51.5074, lng: -0.1278 },
            lookoutDiameter: 100,
          },
        ],
        permissionLevel: role.permissionLevels.Master,
        isActive: true,
        position: "Master",
      },
      {
        firstName: "John",
        lastName: "Doe",
        userName: "john_doe",
        email: "john.doe@example.com",
        birthday: new Date("1990-05-15"),
        password: hashPassword("john_password"),
        workSpaces: [
          {
            id: 1,
            name: "Workspace A",
            coordinates: { lat: 40.7128, lng: -74.006 },
            lookoutDiameter: 500,
          },
          {
            id: 2,
            name: "Workspace B",
            coordinates: { lat: 34.0522, lng: -118.2437 },
            lookoutDiameter: 300,
          },
          {
            id: 3,
            name: "Workspace C",
            coordinates: { lat: 51.5074, lng: -0.1278 },
            lookoutDiameter: 100,
          },
        ],
        permissionLevel: role.permissionLevels.User,
        isActive: true,
        position: "Student",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        userName: "jane_smith",
        email: "jane.smith@example.com",
        birthday: new Date("1992-09-20"),
        password: hashPassword("jane_password"),
        workSpaces: [
          {
            id: 1,
            name: "Workspace A",
            coordinates: { lat: 40.7128, lng: -74.006 },
            lookoutDiameter: 500,
          },
          {
            id: 2,
            name: "Workspace B",
            coordinates: { lat: 34.0522, lng: -118.2437 },
            lookoutDiameter: 300,
          },
          {
            id: 3,
            name: "Workspace C",
            coordinates: { lat: 51.5074, lng: -0.1278 },
            lookoutDiameter: 100,
          },
        ],
        permissionLevel: role.permissionLevels.User,
        isActive: true,
        position: "Student",
      },
      {
        firstName: "Alice",
        lastName: "Johnson",
        userName: "alice_johnson",
        email: "alice.johnson@example.com",
        birthday: new Date("1988-01-10"),
        password: hashPassword("alice_password"),
        workSpaces: [
          {
            id: 1,
            name: "Workspace A",
            coordinates: { lat: 40.7128, lng: -74.006 },
            lookoutDiameter: 500,
          },
          {
            id: 2,
            name: "Workspace B",
            coordinates: { lat: 34.0522, lng: -118.2437 },
            lookoutDiameter: 300,
          },
          {
            id: 3,
            name: "Workspace C",
            coordinates: { lat: 51.5074, lng: -0.1278 },
            lookoutDiameter: 100,
          },
        ],
        permissionLevel: role.permissionLevels.Member,
        isActive: true,
        position: "Teacher",
      },
    ];

    // Insert users into the database
    for (const identity of seedIdentities) {
      await Identity.create(identity);
    }

    console.log("Database seeded successfully with multiple users.");
  } catch (error) {
    console.error(`Error seeding database:${error}`);
  }
  // STOP DOING THIS SHIT DONT CLOSE THE CONNECTION PLS
  // For you to learn u peice of shit
  // finally {
  //  await mongoose.connection.close(); // Ensure the connection is closed
  // }
};

// Main function to run the script
exports.runSeed = async () => {
  await connect();
  await seedDatabase();
};
