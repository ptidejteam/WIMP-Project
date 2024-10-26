const mongoose = require('mongoose');

const UserAvailabilitySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true }, // Ensure userId is unique and indexed
  isOnline: { type: Boolean, default: false },
  allowOfflineMode: { type: Boolean, default: false },
  availabilityStatus: { type: String, default: "available" },
  customMessage: { type: String, default: "" }, // Ensure correct type
  displayToOthers: { type: Boolean, default: true }
});

// Static method to find or create a user availability
UserAvailabilitySchema.statics.findOrCreate = async function (userId) {
  return await this.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true }
  );
};

// Static method to list user availabilities with pagination
UserAvailabilitySchema.statics.list = function (perPage = 10, page = 0) {
  return this.find()
    .limit(perPage)
    .skip(perPage * page)
    .lean()
    .exec();
};

// Static method to get user availability by userId
UserAvailabilitySchema.statics.getById = async function (userId) {
  return await this.findOne({ userId }).lean().exec();
};

UserAvailabilitySchema.statics.updateById = async function (userId, updateData) {
  return this.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { new: true, useFindAndModify: false }
  );
};

// Static method to remove user availability by userId
UserAvailabilitySchema.statics.removeById = async function (userId) {
  return await this.deleteOne({ userId });
};

// Define and export the model
const UserAvailability = mongoose.model('UserAvailability', UserAvailabilitySchema);
// // Check if a document with this userId exists and is unique
// // const userCheck =  UserAvailability.find({ userId: "671b0c4f3a4433f3cf9c93d6" });
// // console.log(userCheck._id);

// (async () => {
//   try {
//     const result = await UserAvailability.updateById("671b0c4f3a4433f3cf9c93d6", { customMessage: "Something Message" });
//     console.log("Update result:", JSON.stringify(result));
//   } catch (error) {
//     console.error("Direct update error:", error);
//   }
// })();

module.exports = UserAvailability;
