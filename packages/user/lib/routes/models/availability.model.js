const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true }, // Ensure userId is unique and indexed
  isOnline: { type: Boolean, default: false },
  allowOfflineMode: { type: Boolean, default: false },
  availabilityStatus: { type: String, default: "available" },
  // Define the default message for the each user
  // TODO : Add fonctionnality that
  defaultMessages: {
    type: Array,
    default: [
      { text: "I am currently busy. Please leave a message.", status: "away" },
      { text: "I will get back to you shortly.", status: "available" },
      { text: "Out for lunch, please leave a message.", status: "away" },
      { text: "Currently in a meeting, please do not disturb.", status: "do-not-disturb" },
      { text: "On a break, will respond soon.", status: "away" },
    ],
  },
  userMessages: { type: Array, default: [] },
  customMessage: { type: String, default: "" }, // Ensure correct type
  displayToOthers: { type: Boolean, default: true },
});

availabilitySchema.virtual("id").get(() => this._id.toHexString());

// Ensure virtual fields are serialized
availabilitySchema.set("toJSON", {
  virtuals: true
});

const Availability = mongoose.model("Availability", availabilitySchema);

// Static method to find or create a user availability
exports.findOrCreate = async function (userId) {
  return await Availability.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true }
  );
};

// Static method to list user availabilities with pagination
exports.list = function (perPage = 10, page = 0) {
  return Availability.find()
    .limit(perPage)
    .skip(perPage * page)
    .lean()
    .exec();
};

// Static method to get user availability by userId
exports.getById = (userId)  => {
 return Availability.findOne({ userId }).lean().exec();
};

exports.updateById = async function (userId, updateData) {
  return Availability.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { new: true, useFindAndModify: false }
  );
};

exports.updateDefaultMessages = async function (data) {
  return Availability.updateMany(
    {},
    { $set: { defaultMessages: data } },
    { useFindAndModify: false }
  );
};

// Static method to remove user availability by userId
exports.removeById = async function (userId) {
  return await Availability.deleteOne({ userId });
};

const seedDatabase = async () => {
  try {
    await Availability.deleteMany({});
    console.log("Availability has been removed successfully.");
  } catch (error) {
    console.error("Error seeding the database:", error);
  }
};

// Conditionally seed the database
if (process.env.SEED_DB === "true") {
  seedDatabase();
}
