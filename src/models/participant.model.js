const mongoose = require('mongoose');
const Group = require('./group.model.js');

const participantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'groups',
        required: true
    },
    // Used when isConversation is false
    isAdmin: {
        type: Boolean
    },
    isOwner: {
        type: Boolean
    }
}, {
    timestamps: true,
    autoIndex: false
});

participantSchema.post("save", async function (data) {
    await Group.updateOne({ _id: data.groupId }, { $inc: { participants: 1 } });
});

participantSchema.post("remove", async function (data) {
    await Group.updateOne({ _id: data.groupId }, { $inc: { participants: -1 } });
});

module.exports = mongoose.model('participants', participantSchema);