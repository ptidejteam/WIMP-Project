const mongoose = require("mongoose");
const path = require("path");
const UserAvailability = require("./availability.model"); // Import the UserAvailability model

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { hashPassword } = require("@wimp-project/utils");

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

const identitySchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthday: { type: Date },
    userName: { type: String, unique: true, required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    permissionLevel: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    position: { type: String, default: "Student" },
    avatar: { type: String, default: "images/face-1.jpg" },
    emailStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    googleAccessToken: { type: String }, // Token for Google Calendar API
    googleAccessTokenExpiry: { type: Date }, // Expiry time for the access token
    googleCalendarEvents: [
      {
        eventId: { type: String, required: true },
        summary: { type: String },
        description: { type: String },
        start: { type: Date },
        end: { type: Date },
        location: { type: String },
        status: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Virtual ID field
identitySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
identitySchema.set("toJSON", { virtuals: true });

// Model
const Identity = mongoose.model("Users", identitySchema);

exports.findIfTokenExists = () => {
  return Identity.find({ googleAccessToken: { $exists: true } })
    .lean()
    .exec();
};

exports.findByIdAndUpdateEvents = (userId, eventRecords) =>
  Identity.findByIdAndUpdate(
    userId,
    { $set: { googleCalendarEvents: eventRecords } },
    { new: true, useFindAndModify: false }
  ).exec();

// Methods
exports.findByEmail = (email) => Identity.findOne({ email }).lean().exec();

exports.findById = async (id) => {
  const result = await Identity.findOne({ _id: id }).lean().exec();
  if (result) {
    delete result._id;
    delete result.__v;
    delete result.password;
  }
  return result;
};

exports.findByUserName = (userName) =>
  Identity.findOne({ userName }).lean().exec();

exports.createIdentity = async (userData) => {
  const identity = new Identity(userData);
  await identity.save(); // Save the identity first
  // Create the default UserAvailability record
  await UserAvailability.findOrCreate(identity.id); // Using the newly created identity's id

  return identity; // Return the created identity
};

exports.list = (perPage = 10, page = 0) =>
  Identity.find()
    .limit(perPage)
    .skip(perPage * page)
    .lean()
    .exec();

exports.updateById = (id, data) =>
  // Don't update the password
  Identity.findByIdAndUpdate(id, data, { new: false }).lean().exec();

exports.removeById = (id) => Identity.deleteOne({ _id: id }).exec();

// Save or update Google Calendar token and its expiry
exports.saveGoogleToken = async (userId, accessToken, expiresIn) => {
  const expiryDate = new Date(Date.now() + expiresIn * 1000); // Calculate expiry time from now

  return Identity.findByIdAndUpdate(
    userId,
    {
      $set: {
        googleAccessToken: accessToken,
        googleAccessTokenExpiry: expiryDate,
      },
    },
    { new: true, useFindAndModify: false }
  )
    .lean()
    .exec();
};

// Retrieve Google Calendar token and check if it's expired
exports.getGoogleToken = async (userId) => {
  const user = await Identity.findById(
    userId,
    "googleAccessToken googleAccessTokenExpiry"
  )
    .lean()
    .exec();

  if (user && user.googleAccessTokenExpiry > new Date()) {
    return user.googleAccessToken;
  } else {
    return null; // Token is expired or doesn't exist
  }
};

// Seed data and function
const seedIdentities = {
  firstName: "Admin",
  lastName: "Admin",
  userName: "admin_user",
  birthday: new Date(),
  password: hashPassword("admin_password"), // Hashed password
  permissionLevel: 1,
  isActive: true,
  emailStatus: "sent", // Set default email status for seed data if needed
};
const seedDatabase = async () => {
  try {
    await Identity.deleteMany({});
    console.log("Existing identities cleared.");

    await this.createIdentity(seedIdentities);
    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding the database:", error);
  }
};

// Conditionally seed the database
if (process.env.SEED_DB === "true") {
  seedDatabase();
}
