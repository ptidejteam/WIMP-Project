const mongoose = require('mongoose');

const UserAvailabilitySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  isOnline: { type: Boolean, default: true },
  allowOfflineMode: { type: Boolean, default: true },
  availabilityStatus: { type: String, default: 'Available' },
  customMessage: { type: String, default: '' },
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

// Static method to update user availability by userId
UserAvailabilitySchema.statics.updateById = async function (userId, updateData) {
  return await this.findOneAndUpdate({ userId }, updateData, { new: true });
};

// Static method to remove user availability by userId
UserAvailabilitySchema.statics.removeById = async function (userId) {
  return await this.deleteOne({ userId });
};

module.exports = mongoose.model('UserAvailability', UserAvailabilitySchema);
