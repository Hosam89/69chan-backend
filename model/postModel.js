const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mediaUrl: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // nickname / pfp
  // comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  comments: [{ type: String, maxlength: 50 }],
  // likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // uid
  likes: Number,
  tags: [String], // zu was gehört der Post für algo
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
