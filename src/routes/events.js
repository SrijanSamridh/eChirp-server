const express = require("express");
const Event = require("../models/event.models");
const User = require("../models/user.models");

const eventRoute = express.Router();

// Create event route
eventRoute.post("/", async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    const event = await newEvent.save();

    const user = await User.findById(req.body.createdBy);
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

// Join event route
eventRoute.post("/join", async (req, res) => {
  try {
    const { eventID, userID } = req.body;

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

// Get user's created events route
eventRoute.get("/created/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
    const user = await User.findById(userID).populate("myCreatedEvents");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ events: user.myCreatedEvents });
  } catch (error) {
    console.error("Error fetching user's created events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user's attended events route
eventRoute.get("/attended/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
    const user = await User.findById(userID).populate("eventsAttended");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ events: user.eventsAttended });
  } catch (error) {
    console.error("Error fetching user's attended events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all not joined events where eventMode is not equal to private
eventRoute.get("/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    // Find the user by ID
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the events attended by the user
    const eventsAttended = user.eventsAttended;

    // Find all events where createdBy is not the user's ID and eventMode is not private
    const notJoinedEvents = await Event.find({
      createdBy: { $ne: userID }, // createdBy is not equal to user's ID
      eventMode: { $ne: "PRIVATE" }, // eventMode is not equal to private
      _id: { $nin: eventsAttended }, // Event ID is not in the user's eventsAttended
    });

    res.status(200).json({ events: notJoinedEvents });
  } catch (error) {
    console.error("Error fetching not joined events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get upcoming events that user has joined and can be verified by current date and time
eventRoute.get("/upcoming/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

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
    }).sort({ dateOfEvent }); // Sort events by ascending order of dateOfEvent

    res.status(200).json({ events: upcomingEvents });
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({ message: "Internal server error" });
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

    if(event.dateOfEvent <= new Date()){
        return res.status(404).json({message: "Event can't be Canceled a day before or after!"});
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
