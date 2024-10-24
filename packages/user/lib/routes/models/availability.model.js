// models/UserAvailability.js

const mongoose = require('mongoose');

const UserAvailabilitySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  isOnline: { type: Boolean, default: true },
  allowOfflineMode: { type: Boolean, default: true },
  availabilityStatus: { type: String, default: 'Available' },
  customMessage: { type: String, default: '' },
  displayToOthers: { type: Boolean, default: true }
});

UserAvailabilitySchema.statics.findOrCreate = async function (userId) {
  return await this.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true }
  );
};

UserAvailabilitySchema.statics.updateById = async function (userId, updateData) {
  return await this.findOneAndUpdate({ userId }, updateData, { new: true });
};

UserAvailabilitySchema.statics.removeById = async function (userId) {
  return await this.deleteOne({ userId });
};

module.exports = mongoose.model('UserAvailability', UserAvailabilitySchema);
