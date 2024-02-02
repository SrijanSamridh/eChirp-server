const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mainCategory: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    subSubCategory: {
      type: String,
    },
    dateOfEvent: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    nameOfPlace: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    maxParticipants: {
      type: Number,
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    eventMode: {
      type: String,
      enum: ["PRIVATE", "PUBLIC"],
      default: "PUBLIC",
    },
    ageRange: {
      type: String,
    },
    gender: {
      type: String,
    },
    femaleCount: {
      type: Number,
      default: 0,
    },
    maleCount: {
      type: Number,
      default: 0,
    },
    occupation: {
      type: String,
    },
    eventTitle: {
      type: String,
      required: true,
    },
    eventDescription: {
      type: String,
      required: true,
    },
    coverImgUrl: {
      type: String,
      required: true,
    },
    coverImgUrl: {
      type: String,
      required: true,
    },
    Img1Url: {
      type: String,
    },
    Img2Url: {
      type: String,
    },
    Img3Url: {
      type: String,
    },
    Img4Url: {
      type: String,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
