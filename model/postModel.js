const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mediaUrl: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: String, maxlength: 50 }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [String],
})

const Post = mongoose.model('Post', PostSchema)

module.exports = Post
