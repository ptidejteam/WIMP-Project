const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true }, // Ensure userId is unique and indexed
  isOnline: { type: Boolean, default: false },
  allowOfflineMode: { type: Boolean, default: false },
  availabilityStatus: { type: String, default: "available" },
  customMessage: { type: String, default: "" }, // Ensure correct type
  displayToOthers: { type: Boolean, default: true }
});


availabilitySchema.virtual("id").get(() => this._id.toHexString());

// Ensure virtual fields are serialized
availabilitySchema.set("toJSON", { virtuals: true });


const Availability = mongoose.model("UserAvailability", availabilitySchema);


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
exports.getById = async function (userId) {
  return Availability.findOne({ userId }).lean().exec();
};

exports.updateById = async function (userId, updateData) {
  return Availability.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { new: true, useFindAndModify: false }
  );
};

// Static method to remove user availability by userId
exports.removeById = async function (userId) {
  return await Availability.deleteOne({ userId });
};

