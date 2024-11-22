const mongoose = require("mongoose");
const path = require("path");
const UserAvailability = require("./availability.model"); // Import the UserAvailability model
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Database connection
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      autoCreate: true,
    });
    await mongoose.connection.db.admin().command({ ping: 1 });
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
    email: { type: String, unique: false }, // Simple email validation
    password: { type: String, required: true },
    permissionLevel: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    position: { type: String, default: "Student" },
    avatar: { type: String, default: "images/face-1.jpg" },
    workSpaces: { type: Array },
    phoneNumber: { type: String }, // Optional phone number for user
    preferences: {
      // User-specific settings/preferences
      language: { type: String, default: "en" }, // Language preference
      notifications: { type: Boolean, default: true }, // Enable/disable notifications
    },
    consentGiven: { type: Boolean, default: false },
    lastLogin: { type: Date }, // Last login timestamp
    googleAccessToken: { type: String }, // Token for Google Calendar API
    googleAccessTokenExpiry: { type: Date }, // Expiry time for the access token
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

// exports.findByIdAndUpdateEvents = (userId, eventRecords) =>
//   Identity.findByIdAndUpdate(
//     userId,
//     { $set: { googleCalendarEvents: eventRecords } },
//     { new: true, useFindAndModify: false }
//   ).exec();

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

exports.create = async (userData) => {
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
  Identity.findByIdAndUpdate(id, data, { new: false }).lean().exec();

exports.removeById = (id) => Identity.deleteOne({ _id: id }).exec();

exports.deleteMany = () => Identity.deleteMany({}).exec();

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

exports.clearPrivacyData = async (userId) => {
  return Identity.findByIdAndUpdate(
    userId,
    {
      $unset: {
        googleAccessToken: "",
        googleAccessTokenExpiry: "",
        lastLogin: "",
      },
      $set: {
        consentGiven: false,
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
