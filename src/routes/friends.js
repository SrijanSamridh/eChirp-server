const express = require("express");
const User = require("../models/user.models");
const friendRoute = express.Router();
const { Types } = require("mongoose");

// Send Friend Request Route
friendRoute.post("/send/:accepterId/:senderId", async (req, res) => {
  const { accepterId, senderId } = req.params;

  try {
    // Check if both users exist
    const accepter = await User.findById(accepterId);
    const sender = await User.findById(senderId);

    if (!accepter || !sender) {
      return res.status(404).json({ error: "One or more users not found" });
    }

    // Check if a friend request already exists
    if (
      accepter.friendRequests.includes(sender._id) ||
      sender.friendRequests.includes(accepter._id)
    ) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    if (
      accepter.friends.includes(sender._id) ||
      sender.friends.includes(accepter._id)
    ) {
      return res.status(400).json({ error: "Already Friends!" });
    }

    // Add friend request to accepter's friendRequests array
    accepter.friendRequests.push(sender._id);
    await accepter.save();

    res.json({
      message: `Friend request sent successfully ! ${sender.username} sended the request to ${accepter.username}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Accept Friend Request Route
friendRoute.post("/accept/:accepterId/:senderId", async (req, res) => {
  const { accepterId, senderId } = req.params;

  try {
    // Check if both users exist
    const accepter = await User.findById(accepterId);
    const sender = await User.findById(senderId);

    if (!accepter || !sender) {
      return res.status(404).json({ error: "One or more users not found" });
    }

    // Check if there is a friend request from accepter to sender
    if (!accepter.friendRequests.includes(sender._id)) {
      return res.status(400).json({ error: "No friend request found" });
    }

    // Remove friend request from accepter's friendRequests array
    accepter.friendRequests = accepter.friendRequests.filter(
      (requestId) => !requestId.equals(sender._id)
    );

    // Add sender to accepter's friends array and vice versa
    accepter.friends.push(sender._id);
    sender.friends.push(accepter._id);

    // Save changes to both users
    await accepter.save();
    await sender.save();

    res.json({
      message: `${accepter.username} accepted ${sender.username} request successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Internal Server Error: ${error}` });
  }
});

friendRoute.get("/mutual/:userId1/:userId2", async (req, res) => {
  const { userId1, userId2 } = req.params;

  try {
    // Find the users
    const user1 = await User.findById(userId1).populate("friends");
    const user2 = await User.findById(userId2).populate("friends");

    // Get mutual friends
    const mutualFriends = user1.friends.filter((friendId) =>
      user2.friends.includes(friendId.toString())
    );

    res.json({ mutualFriends });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//! Get Friends of Friends Route
friendRoute.get('/friends-of-friends/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate that userId is a valid ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Find the user and populate friends
    const user = await User.findById(userId).populate('friends');

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get friends of friends
    const friendsOfFriends = [];
    for (const friendId of user.friends) {
      // Ensure friendId is a valid ObjectId before querying the database
      if (Types.ObjectId.isValid(friendId)) {
        const friend = await User.findById(friendId).populate('friends');
        if (friend) {
          friendsOfFriends.push(...friend.friends);
        }
      }
    }

    // Remove duplicates and the user and user's direct friends from the list
    const uniqueFriendsOfFriends = Array.from(new Set(friendsOfFriends.map(friend => friend.toString())))
      .filter(friendId => !user.friends.map(f => f.toString()).includes(friendId) && friendId !== userId);

    // Populate details of friends of friends
    const friendsOfFriendsDetails = await User.find({ _id: { $in: uniqueFriendsOfFriends } });

    res.json({ friendsOfFriends: friendsOfFriendsDetails });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = friendRoute;

