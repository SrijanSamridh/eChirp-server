const express = require("express");
const User = require('../models/user.models');
const Auth = require("../middlewares/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getFirebaseUser } = require("../../config/firebase");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  let { username, providerId, password, provider, verificationId, profilePicture, firstName, lastName } = req.body;

  try {
    if(provider === "local" || !provider){
      password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    } else {
      switch(provider){
        case "google":
          let googleUser = await getFirebaseUser(verificationId);
          let { email, photoURL, displayName } = googleUser.providerData[0];
          providerId = email;
          profilePicture = photoURL;
          firstName = displayName.split(" ")[0];
          lastName = displayName.split(" ")[1];
          username = email.split("@")[0];
          break;
      }
      password = null;
    }

    const newUser = await (new User({
      firstName,
      lastName,
      username,
      providerId,
      password,
      provider,
      profilePicture
    })).save();

    console.log(newUser);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
    res.header("x-auth-token", token);

    res.status(200).json({ message: "User registered successfully", body: {
      ...newUser._doc,
      token
    }});
  } catch (error) {
    res.status(500).json({ error: `Internal Server Error: ${error}` });
  }
});

/// SignIn route
authRouter.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    // check if User exists
    const checkuser = await User.findOne({ username });
    if (!checkuser) {
      return res.status(400).json({
        message: "Invalid username please try again with correct username",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, checkuser.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials Password does not match",
      });
    }

    // generate token
    const token = jwt.sign({ id: checkuser._id }, process.env.JWT_SECRET);
    res.header("x-auth-token", token);

    // send response
    res.status(200).json({
      message: "User signin successfully",
      user: {...checkuser._doc, token},
    });

  } catch (err) {
    res.status(500).json({
      message: `Internal server error : ${err.message}`,
    });
  }
});

// Get user data 
authRouter.get('/', Auth, async (req, res) =>{
  const userId = req.user.id;
  try {
      const user = await User.findById(userId);
      if(!user){
        return res.status(404).json({message: "User not found"});
      }

      res.status(200).json(user);
  } catch (error) {
      res.status(500).json({message: "Internal Server Error"});
  }
});

// update user Details ---> PUT Method 
authRouter.put("/", Auth, async (req, res) => {
  const userId = req.user.id;
  const { username, providerId, firstName, lastName, bio } = req.body;

  try {
    // Fetch the user from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user details
    if (username !== undefined) {
      user.username = username;
    }
    if (providerId !== undefined) {
      user.providerId = providerId;
    }
    if (firstName !== undefined) {
      user.firstName = firstName;
    }
    if (lastName !== undefined) {
      user.lastName = lastName;
    }
    if (bio !== undefined) {
      user.bio = bio;
    }

    // Save the updated user data to the database
    await user.save();

    res.status(200).json({ message: "User details updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});




module.exports = authRouter;


// const express = require("express");
// const auth = require("../middlewares/auth.js");
// const { createUser, loginUser, validToken, getUser } = require("../controllers/user.js");
// const authRouter = express.Router();

// // SignUp route
// authRouter.post("/signup", createUser);
// // SignIn route
// authRouter.post("/signin", loginUser);
// // Validate Token
// authRouter.post("/tokenIsValid", validToken);
// // Get User
// authRouter.get("/", auth, getUser);

// module.exports = authRouter;