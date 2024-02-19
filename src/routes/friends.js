const express = require("express");
const User = require("../models/user.models");
const Auth = require("../middlewares/auth");
const friendRoute = express.Router();
const mongoose = require("mongoose");

// Send Friend Request Route
friendRoute.post("/send", Auth, async (req, res) => {
  const userID = req.user.id;
  const { friendID } = req.body;

  try {
    // Check if both users exist
    const friend = await User.findById(friendID);
    const user = await User.findById(userID);

    if (!friend || !user) {
      // Combine the checks for friend and user existence
      return res.status(404).json({ error: "Friend or user not found!" });
    }

    // Check if a friend request already exists
    if (
      friend.friendRequests.includes(user._id) ||
      user.friendRequests.includes(friend._id)
    ) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    // Check if they are already friends
    if (
      friend.friends.includes(user._id) ||
      user.friends.includes(friend._id)
    ) {
      return res.status(400).json({ error: "Already Friends!" });
    }

    // Add friend request to friend's friendRequests array
    friend.friendRequests.push(user._id);
    await friend.save();

    res.json({
      message: `Friend request sent successfully! ${user.username} sent the request to ${friend.username}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Accept Friend Request Route
friendRoute.post("/accept", Auth, async (req, res) => {
  const userID = req.user.id;
  const { friendID } = req.body;

  try {
    // Check if both users exist
    const user = await User.findById(userID);
    const friend = await User.findById(friendID);

    if (!user || !friend) {
      return res.status(404).json({ error: "One or more users not found" });
    }

    // Check if there is a friend request from friend to user
    if (!user.friendRequests.includes(friend._id)) {
      return res.status(400).json({ error: "No friend request found" });
    }

    // Remove friend request from user's friendRequests array
    user.friendRequests = user.friendRequests.filter(
      (requestId) => !requestId.equals(friend._id)
    );

    // Add friend to user's friends array and vice versa
    user.friends.push(friend._id);
    friend.friends.push(user._id);

    // Save changes to both users
    await user.save();
    await friend.save();

    res.json({
      message: `${user.username} accepted ${friend.username} request successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Internal Server Error: ${error}` });
  }
});

friendRoute.get("/mutual/:friendID", Auth, async (req, res) => {
  const userID = req.user.id;
  const { friendID } = req.params;

  try {
    // Find the users
    const user = await User.findById(userID).populate("friends");
    const friend = await User.findById(friendID).populate("friends");

    // Get mutual friends
    const mutualFriends = user.friends.filter((friendId) =>
      friend.friends.includes(friendId.toString())
    );

    res.json({ mutualFriends });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//! Get Friends of Friends Route
friendRoute.get("/friends-of-friends/:friendID", Auth, async (req, res) => {
  const userID = req.user.id;
  const { friendID } = req.params;

  try {
    // Validate that friendID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(friendID)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Find the user and populate friends
    const user = await User.findById(userID).populate("friends");

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get friends of friends
    const friendsOfFriends = [];
    for (const friendId of user.friends) {
      // Ensure friendId is a valid ObjectId before querying the database
      if (mongoose.Types.ObjectId.isValid(friendId)) {
        const friend = await User.findById(friendId).populate("friends");
        if (friend) {
          friendsOfFriends.push(...friend.friends);
        }
      }
    }

    // Remove duplicates and the user and user's direct friends from the list
    // const uniqueFriendsOfFriends = [];
    // for (const friendId of friendsOfFriends) {
    //   let isDuplicate = false;
    //   // Ensure friendId is a valid ObjectId
    //   if (mongoose.Types.ObjectId.isValid(friendId)) {
    //     // Check if friendId is not the user, user's friends, or duplicate
    //     if (friendId.toString() !== userID.toString()) {
    //       for (const userFriendId of user.friends) {
    //         if (userFriendId.toString() === friendId.toString()) {
    //           isDuplicate = true;
    //           break;
    //         }
    //       }
    //       if (!isDuplicate) {
    //         for (const directFriendId of friendsOfFriends) {
    //           if (
    //             directFriendId.toString() === friendId.toString() &&
    //             directFriendId.toString() !== userID
    //           ) {
    //             isDuplicate = true;
    //             break;
    //           }
    //         }
    //       }
    //       if (!isDuplicate) {
    //         uniqueFriendsOfFriends.push(friendId.toString());
    //       }
    //     }
    //   }
    // }

    // Populate details of friends of friends
    const friendsOfFriendsDetails = await User.find({
      _id: { $in: friendsOfFriends },
    });

    res.json({ friendsOfFriends: friendsOfFriendsDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = friendRoute;
