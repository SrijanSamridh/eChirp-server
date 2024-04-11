const express = require("express");
const Event = require("../models/event.models");
const User = require("../models/user.models");
const Auth = require("../middlewares/auth");
const { putObjectUrl, getObjectUrl } = require("../services/s3");
const mongoose = require("mongoose");

const eventRoute = express.Router();

// Get all not joined events where eventMode is not equal to private
eventRoute.get("/", Auth, async (req, res) => {
  const userID = req.user.id;
  try {
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const eventsAttended = user.eventsAttended;

    const notJoinedEvents = await Event.find({
      createdBy: { $ne: userID }, // createdBy is not equal to user's ID
      eventMode: { $ne: "PRIVATE" }, // eventMode is not equal to private
      _id: { $nin: eventsAttended }, // Event ID is not in the user's eventsAttended
    }).populate("createdBy", {
      username: 1,
      email: 1
    });

    res.status(200).json({ events: notJoinedEvents });
  } catch (error) {
    console.error("Error fetching not joined events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create event route // TODO: make suer to upload file from the front-end through the upload URl
eventRoute.post("/", Auth, async (req, res) => {
  const userId = req.user.id;
  try {
    // Upload cover image to S3 and get signed URL
    const coverImageUrl = await putObjectUrl(
      `cover-image-${userId}.png`,
      "image/png"
    );

    // Upload other images to S3 and get signed URLs if they exist
    const imageUrls = {};
    const imageFields = ["Img1Path", "Img2Path", "Img3Path", "Img4Path"];
    for (const field of imageFields) {
      if (req.body[field]) {
        const imageUrl = await putObjectUrl(
          `image-${userId}-${field.replace("Path", "")}.jpeg`,
          "image/jpeg"
        );
        imageUrls[field.replace("Path", "Url")] = imageUrl;
      }
    }

    // Create event document with signed image URLs
    const eventData = {
      ...req.body,
      createdBy: userId,
      coverImgUrl: coverImageUrl,
      ...imageUrls,
    };
    const newEvent = new Event(eventData);
    const event = await newEvent.save();

    // Update user's created events
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.myCreatedEvents.push(event._id);
    user.numberOfEventsCreated = user.myCreatedEvents.length;
    await user.save();

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user's created events route
eventRoute.get("/created", Auth, async (req, res) => {
  const userID = req.user.id;
  try {
    const user = await User.findById(userID).populate("myCreatedEvents").lean();

    let events = user.myCreatedEvents.map((event) => {
      return {
        ...event,
        createdBy: {
          _id: user._id,
          username: user.username,
          email: user.email,
        }
      }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching user's created events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Join event route
eventRoute.post("/join", Auth, async (req, res) => {
  const userID = req.user.id;
  try {
    const { eventID } = req.body;

    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check if the user has already join the event
    if (event.participants.includes(userID)) {
      return res
        .status(400)
        .json({ message: "User Already joined the event!" });
    }

    user.eventsAttended.push(eventID);
    user.numberOfEventsAttended = user.eventsAttended.length;
    event.participants.push(userID);

    await user.save();
    await event.save();

    res.status(201).json({ message: "Event Joined successfully", event });
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user's attended events route
eventRoute.get("/attended", Auth, async (req, res) => {
  const userID = req.user.id;
  const currentDate = new Date();

  try {
    const user = await User.findById(userID).populate({
      path: "eventsAttended",
      match: { dateOfEvent: { $lt: currentDate } }, // Only include events whose dateOfEvent is less than the current date
    }).lean();

    let events = user.eventsAttended.map((event) => {
      return {
        ...event,
        createdBy: {
          _id: user._id,
          username: user.username,
          email: user.email,
        }
      }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching user's attended events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get upcoming events that user has joined and can be verified by current date and time
eventRoute.get("/upcoming", Auth, async (req, res) => {
  const userID = req.user.id;
  try {
    // Find the user by ID
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the events attended by the user
    const eventsAttended = user.eventsAttended;

    // Get the current date and time
    const currentDate = new Date();

    // Find upcoming events where event's date and time is after the current date and time
    const upcomingEvents = await Event.find({
      _id: { $in: eventsAttended }, // Event ID is in the user's eventsAttended
      dateOfEvent: { $gte: currentDate }, // Event's date is after or equal to current date
    }).sort({ dateOfEvent: 1 }).populate("createdBy", {
      username: 1,
      email: 1
    }); // Sort events by ascending order of dateOfEvent

    res.status(200).json({ events: upcomingEvents });
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

eventRoute.get("/uploadPic", Auth, async (req, res) => {
  try {
    const userID = req.user.id;
    const putUrl = await putObjectUrl(`image${userID}.jpeg`, "image/jpeg");
    res.json({ putUrl });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single event shareable link
eventRoute.get("/:eventID", async (req, res) => {
  try {
    const { eventID } = req.params;

    // Find the event by its ID
    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Send the event ID in the response
    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Cancel event route
eventRoute.delete("/:eventID", async (req, res) => {
  try {
    const { eventID } = req.params;

    // Find the event by its ID
    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.dateOfEvent <= new Date()) {
      return res
        .status(404)
        .json({ message: "Event can't be Canceled a day before or after!" });
    }

    // Update each participant's attended events count
    for (const participantID of event.participants) {
      const participant = await User.findById(participantID);
      if (participant) {
        participant.eventsAttended = participant.eventsAttended.filter(
          (eventId) => eventId.toString() !== eventID
        );
        participant.numberOfEventsAttended = participant.eventsAttended.length;
        await participant.save();
      }
    }

    // Update the creator's created events count
    const creator = await User.findById(event.createdBy);
    if (creator) {
      creator.myCreatedEvents = creator.myCreatedEvents.filter(
        (eventId) => eventId.toString() !== eventID
      );
      creator.numberOfEventsCreated = creator.myCreatedEvents.length;
      await creator.save();
    }

    // Remove the event from the database
    await Event.findByIdAndDelete(eventID);

    // Respond with success message
    res.status(200).json({ message: "Event canceled successfully" });
  } catch (error) {
    console.error("Error canceling event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = eventRoute;
