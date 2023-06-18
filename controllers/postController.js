// import dependencies
const Post = require('../model/postModel')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const User = require('../model/userModel');

// set up cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

// set up multer and cloudinary storage engine
storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: `user_posts`,
    format: async (req, file) => {
      let format
      // set allowed file formats here
      switch (file.mimetype) {
        case 'image/jpeg':
          format = 'jpg'
          break
        case 'image/png':
          format = 'png'
          break
        case 'image/gif':
          format = 'gif'
          break
        default:
          format = 'jpg'
          break
      }
      return format
    },
  },
})

// set up multer middleware for handling file uploads
const upload = multer({ storage: storage })

// define cloudinary folder where posts will be uploaded to
module.exports.uploadmediaUrl = upload.single('mediaUrl');

// controller for adding a single post by a user
module.exports.addSinglePost = async (req, res, next) => {
  // create a new post object from Post model
  const newPost = new Post({
    title: req.body.title,
    description: req.body.description,
    mediaUrl: req.file.path,
    user: req.body.user,
    comments: req.body.comments,
    likes: req.body.likes,
    tags: req.body.tags,
  })
  try {
    await newPost.save()
    if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: `user_posts/${newPost.user}/post`,
    })
    newPost.mediaUrl = result.secure_url
    await newPost.save()
  }
    res.status(200).json({ message: 'Post added, yay~', newPost })
  } catch (err) {
    next(err)
  }
}

// controller for retrieving a single user post
module.exports.getSinglePost = async (req, res, next) => {
  // extract post ID from request params
  const id = req.params.id
  try {
    // attempt post retrieval by ID
    const post = await Post.find({ _id: id })
    // respond with status 200 and post data
    res.status(200).json({ message: 'Post found, nya~', post })
  } catch (err) {
    next(err)
  }
}

// controller for retrieving all user posts
module.exports.getUserPosts = async (req, res, next) => {
  const userId = req.params.userId

  try {
    // fetch user by id
    const user = await User.find({ _id: userId })
    // check if user exists
    if (!user) {
      res.status(404).json({ message: 'User is not registered!' })
    }
    // fetch all user posts from db
    const userPosts = await Post.find({ user: userId})
    // check if user has any posts at all
    if (!userPosts) {
      res.status(404).json({ message: `${user.name} does not have any posts yet! Start uploading!` })
    }
    // respond with the fetched user posts
    res.status(200).json({ message: 'Posts found, woohoo~', userPosts })
  } catch (err) {
    next(err)
  }
}

// controller for deleting a single user post
module.exports.deleteSinglePost = async (req, res, next) => {
  // extract post ID from request params
  const id = req.params.id
  try {
    // fetch post by id
    const post = await Post.findById(id)
    // check if post exists
    if (!post) {
      res.status(404).json({ message: 'Post not found.' })
    } else {
      // delete any post uploads to cloudinary
      await cloudinary.uploader.destroy(`user_posts/${post.user}/post`)
      // delete the post data from mongoDB
      await Post.deleteOne({ _id: id })
      res.status(200).json({ message: 'Post deleted successfully.' })
    }
  } catch (err) {
    next (err)
  }
}

// controller for searching posts
module.exports.tagSearch = async (req, res, next) => {
  if (req.query.tag) {
    try {
      const tag = req.query.tag
      const posts = await Post.find()
      const matchingPosts = posts.filter((post) => post.tags.includes(tag))
      res.status(200).json({ message: 'Found matching posts, yuss~', matchingPosts })
    } catch (err) {
      res.status(500).json({ message: 'Error searching by tag', err })
      next(err)
    }
  } else {
    next()
  }
}

// controller for updating a single post modularly
module.exports.updateSinglePost = async (req, res, next) => {
  // extract post ID from request params
  const id = req.params.id;
  try {
    // before we can update we still must find the post first
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: 'Post not found.' });
    } else {
      // check if a new post picture is uploaded to cloudinary
      if (req.file) {
        const public_id = `user_posts/${post._id}`;
        await cloudinary.uploader.destroy(public_id);
      }
      // findOneAndUpdate detects every field of the post and allows updating them
      await Post.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            title: req.body.title || post.title,
            description: req.body.description || post.description,
            mediaUrl: req.file ? req.file.path : post.mediaUrl,
            tags: req.body.tags || post.tags,
            likes: req.body.likes || post.likes
          },
        }
      )
      res.status(200).json({ message: 'Post edited.' });
    }
  } catch (err) {
    next(err);
  }
}

// controller for liking posts
module.exports.likePost = async (req, res, next) => {
  const { userId, postId } = req.body
  try {
    const likedPost = await Post.findById(postId)
    console.log('post', likedPost)
    if (likedPost.likes.includes(userId)) {
      res.status(400).json({ message: 'User already liked this post!', likedPost })
    } else {
      likedPost.likes.push(userId)
      console.log('likes', likedPost.likes)
      await likedPost.save()
      res.status(200).json({ message: 'Post liked successfully.' });
    }
  } catch (err) {
    next(err)
  }
}


