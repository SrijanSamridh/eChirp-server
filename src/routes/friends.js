const express = require("express");
const User = require("../models/user.models");
const Auth = require("../middlewares/auth");
const friendRoute = express.Router();
const mongoose = require("mongoose");
const { Types } = require("mongoose");

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

// Get Friends of Friends Route
friendRoute.get('/friends-of-friends/:userId', Auth, async (req, res) => {
  const { userId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    let data = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "friends",
          foreignField: "_id",
          as: "friendsList"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "friendsList.friends",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                _id: {
                  $ne: new mongoose.Types.ObjectId(userId)
                }
              }
            }
          ],
          as: "friendsOfFriends"
        }
      },
      {
        $project: {
          friendsOfFriends: {
            $filter: {
              input: "$friendsOfFriends",
              as: "friend",
              cond: {
                $in: [new mongoose.Types.ObjectId(req.user.id), "$$friend.friends"]
              }
            }
          }
        }
      }
    ]);

    const totalFriendsOfFriends = data.reduce((total, user) => total + user.friendsOfFriends.length, 0);

    return res.json({ count: totalFriendsOfFriends, data: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Internal Server Error : ${error}` });
  }
});


friendRoute.delete("/:id", Auth, async (res, req) => {
  const userId = req.user.id;
  const { friendId } = req.params;

  try {
    const [user, friend] = await Promise.all([
      User.findById(userId).populate("friends"), // Pre-populate friends field
      User.findById(friendId),
    ]);

    if (!user || !friend) {
      return res.status(404).json({ error: "One or more users not found" });
    }

    const friendIndex = user.friends.findIndex(
      (friendId) => friendId.toString() === friend._id.toString()
    );
    if (friendIndex === -1) {
      return res
        .status(404)
        .json({ error: "Friend not found in user's friend list" });
    }

    user.friends.splice(friendIndex, 1);
    friend.friends.splice(friend.friends.indexOf(userId), 1);

    await Promise.all([user.save(), friend.save()]); // Save both users concurrently

    res.json({
      message: `${user.username} unfriended ${friend.username} successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" }); // Avoid exposing error details
  }
});

module.exports = friendRoute;