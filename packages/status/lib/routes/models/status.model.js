const mongoose = require('mongoose');

// Define Status schema
const statusSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['Available', 'Busy', 'Do Not Disturb', 'Away', 'Offline'],
        default: 'Available',
    },
});

// Define methods for the status model
statusSchema.statics.createStatus = async function (statusData) {
    return this.create(statusData);
};

statusSchema.statics.findStatusById = async function (userId) {
    return this.findOne({ userId });
};

statusSchema.statics.updateStatus = async function (userId, status) {
    return this.findOneAndUpdate({ userId }, { status }, { new: true });
};

statusSchema.statics.removeStatusById = async function (userId) {
    return this.findOneAndDelete({ userId });
};

const StatusModel = mongoose.model('Status', statusSchema);
module.exports = StatusModel;
