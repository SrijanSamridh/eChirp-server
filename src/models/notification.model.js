const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    links: [
        {
            start: {
                type: Number,
                required: true
            },
            end: {
                type: Number,
                required: true
            },
            link: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            typeId: {
                type: String,
                required: true
            }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model("notifications", notificationSchema);