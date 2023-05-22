const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mediaUrl: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  comments: [{ type: String, maxlength: 50 }],
  // likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // uid
  likes: { 
    count: { type: Number, default: 0 },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
   },
  tags: [String],
});

// method for adding a single like to a single post
PostSchema.methods.like = async function (user, req, res, next) {
  try {
    // check if user has already liked the post | "this" refers to the created Post class/document from our schema
    if (this.likes.users.includes(user._id)) {
      throw new Error({ message: `409: User has already liked this post!` });
    }
    // add user to likes.users array and increment likes.count
    this.likes.users.push(user._id); // push the user onto the array
    this.likes.count++;
    await this.save();
    res.status(200).json({ message: `200: Like executed successfully: ${this.likes.count} | ${this.likes.users}` });
  } catch (err) {
    next(err); // pass error down to error handler for the stack trace
  };
};

// method for removing a single like from a single post
PostSchema.methods.unlike = async function (user, req, res, next) {
  try {
    // check if user has not liked the post yet
    if (!this.likes.users.includes(user._id)) {
      throw new Error({ message: `409: User has not liked this post yet!` });
    }
    // remove user from likes.users array and decrement likes.count
    const userIndex = this.likes.users.indexOf(user._id); // get the index pos of the user
    this.likes.users.splice(userIndex, 1); // splice the user out of the array
    this.likes.count--;
    await this.save();
    res.status(200).json({ message: `200: Like revoked successfully: ${this.likes.count} | ${this.likes.users}` });
  } catch (err) {
    next(err);
  };
};

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
