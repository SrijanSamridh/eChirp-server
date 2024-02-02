const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    bio: { type: String },
    profilePicture: { type: String },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    numberOfFriends: { type: Number, default: 0 },
    myCreatedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    eventsAttended: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    numberOfEventsCreated: { type: Number, default: 0 },
    numberOfEventsAttended: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Increment counters based on certain conditions
  if (this.isNew) {
    // For new user creation
    // Increment numberOfFriends, numberOfEventsCreated, etc.
    this.numberOfFriends = this.friends.length;
    this.numberOfEventsCreated = this.myCreatedEvents.length;
    this.numberOfEventsAttended = this.eventsAttended.length;
  } else {
    // For updates, you might need to handle changes in friends, myCreatedEvents, etc.
    // Example: check if friends array changed and update numberOfFriends accordingly
    const friendsChanged = this.isModified("friends");
    if (friendsChanged) {
      this.numberOfFriends = this.friends.length;
    }

    // Similarly, check and update other counters as needed
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
