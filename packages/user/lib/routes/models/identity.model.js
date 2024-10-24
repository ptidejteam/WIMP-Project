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
    password: { type: String, required: true },
    permissionLevel: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    position: { type: String, default : "Student" }, // New field for the user's position/job title
    avatar: { type: String,default:"images/face-1.jpg" }, // Field to store avatar image path or URL
  },
  { timestamps: true }
);

// Virtual ID field
identitySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
identitySchema.set("toJSON", { virtuals: true });

// Static method for finding by ID (corrected)
identitySchema.statics.findByIdCustom = function (id) {
  return this.findOne({ _id: id }).lean().exec();
};

// Model
const Identity = mongoose.model("Users", identitySchema);

// Methods
exports.findByEmail = (email) => Identity.findOne({ email }).lean().exec();

exports.findById = async (id) => {
  const result = await Identity.findByIdCustom(id);
  if (result) {
    delete result._id;
    delete result.__v;
  }
  return result;
};

exports.findByUserName = (userName) => Identity.findOne({ userName }).lean().exec();

exports.createIdentity = async (userData) => {
  const identity = new Identity(userData);
  await identity.save(); // Save the identity first
  console.log(identity.id)
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
  Identity.findByIdAndUpdate(id, data, { new: true }).lean().exec();

exports.removeById = (id) => Identity.deleteOne({ _id: id }).exec();

// Seed data and function
const seedIdentities = 
  {
    firstName: "Admin",
    lastName: "Admin",
    userName: "admin_user",
    birthday: new Date(),
    password: hashPassword("admin_password"), // Hashed password
    permissionLevel: 1,
    isActive: true,
  }
;

const seedDatabase = async () => {
  try {
    await Identity.deleteMany({});
    console.log("Existing identities cleared.");

    this.createIdentity(seedIdentities);
    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding the database:", error);
  }
};

// Conditionally seed the database
if (process.env.SEED_DB === "true") {
  seedDatabase();
}
