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
        permissionLevel: role.permissionLevels.Master,
        isActive: true,
        position: "Master",
        emailStatus: "sent",
      },
      {
        firstName: "John",
        lastName: "Doe",
        userName: "john_doe",
        email: "john.doe@example.com",
        birthday: new Date("1990-05-15"),
        password: hashPassword("john_password"),
        permissionLevel: role.permissionLevels.User,
        isActive: true,
        position: "Student",
        emailStatus: "pending",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        userName: "jane_smith",
        email: "jane.smith@example.com",
        birthday: new Date("1992-09-20"),
        password: hashPassword("jane_password"),
        permissionLevel: role.permissionLevels.User,
        isActive: true,
        position: "Student",
        emailStatus: "sent",
      },
      {
        firstName: "Alice",
        lastName: "Johnson",
        userName: "alice_johnson",
        email: "alice.johnson@example.com",
        birthday: new Date("1988-01-10"),
        password: hashPassword("alice_password"),
        permissionLevel: role.permissionLevels.Admin,
        isActive: true,
        position: "Admin",
        emailStatus: "sent",
      },
    ];

    // Insert users into the database
    for (const identity of seedIdentities) {
      await Identity.create(identity);
    }

    console.log("Database seeded successfully with multiple users.");
  } catch (error) {
    console.error(`Error seeding database:${error}`);
  } finally {
    await mongoose.connection.close(); // Ensure the connection is closed
  }
};

// Main function to run the script
exports.runSeed = async () => {
  await connect();
  await seedDatabase();
};
