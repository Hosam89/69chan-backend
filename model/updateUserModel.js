const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String },
  nickname: { type: String },
  profilePicture: { type: String },
});

const UserProfile = mongoose.model;
