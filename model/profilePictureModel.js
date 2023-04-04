const mongoose = require("mongoose");

const ProfilePictureSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  imageUrl: { type: String, required: true },
});

const ProfilePicture = mongoose.model("ProfilePicture", ProfilePictureSchema);

module.exports = ProfilePicture;
