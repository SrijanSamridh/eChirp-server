const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    providerId: { type: String, required: true },
    password: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    bio: { type: String },
    profilePicture: { type: String },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    numberOfFriends: { type: Number, default: 0 },
    myCreatedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "events" }],
    eventsAttended: [{ type: mongoose.Schema.Types.ObjectId, ref: "events" }],
    numberOfEventsCreated: { type: Number, default: 0 },
    numberOfEventsAttended: { type: Number, default: 0 },
    provider: {
      type: String,
      default: "local"
    }
  },
  { timestamps: true }
);

userSchema.index({username: 1, providerId: 1}, {
  unique: true
});

userSchema.pre("save", async function (next) {
  // Increment counters based on certain conditions
  if (this.isNew) {
    // For new user creation
    // Incrementing numberOfFriends, numberOfEventsCreated, etc.
    this.numberOfFriends = this.friends.length;
    this.numberOfEventsCreated = this.myCreatedEvents.length;
    this.numberOfEventsAttended = this.eventsAttended.length;
  } else {
    // check if friends array changed and update numberOfFriends accordingly
    const friendsChanged = this.isModified("friends");
    if (friendsChanged) {
      this.numberOfFriends = this.friends.length;
    }

    const createdEvents = this.isModified("myCreatedEvents");
    if (createdEvents) {
      this.numberOfEventsCreated = this.numberOfEventsCreated.length;
    }

    const attendedEvents = this.isModified("eventsAttended");
    if (attendedEvents) {
      this.numberOfEventsAttended = this.numberOfEventsAttended.length;
    }
  }

  next();
});

const User = mongoose.model("users", userSchema);

module.exports = User;
