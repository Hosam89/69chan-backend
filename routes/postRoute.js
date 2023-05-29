// import dependencies
const bcrypt = require('bcrypt')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cors = require('cors')
const dotenv = require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const multer = require('multer')
const { multerStorageCloudinary } = require('multer-storage-cloudinary')
const socketio = require('socket.io')
const User = require('../model/userModel')
// import models
const Post = require('../model/postModel')

//Controller Imports
const { tagSearch, postliked } = require('../controllers/postController')

// destruct envs
const { CLOUD_NAME, API_KEY, API_SECRET, SALT_ROUND } = process.env

// set up cloudinary configuration
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
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

// create new router object
const router = express.Router()

// Note: Routes are added in order of complexity as it's considered best practice.
// That should be the case, but I'm too lazy to put the patch route above the rest, lul.

// define POST endpoint for user posts
router
  .post('/add', upload.single('mediaUrl'), async (req, res) => {
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

      const result = await cloudinary.uploader.upload(req.file.path, {
        public_id: `user_posts/${newPost.user}/post`,
      })

      newPost.mediaUrl = result.secure_url
      await newPost.save()
    } catch (err) {
      // catch errors and send status 302 response with thrown error msg
      res.status(302).json({ message: err.message })
    }
  })
  // define GET endpoint for retrieving a single user post
  .get('/:id', async (req, res) => {
    // extract post ID from request params
    const id = req.params.id
    try {
      // attempt post retrieval by ID
      const post = await Post.find({ _id: id })
      // respond with status 200 and post data
      res.status(200).json(post)
    } catch (err) {
      // respond with status 404 and err msg
      res.status(404).json(err)
    }
  })
  // define route handler for GET request on root endpoint
  .get('/', tagSearch, async (req, res) => {
    try {
      // fetch all posts from the database
      const posts = await Post.find()
      res.status(200).json(posts)
    } catch (err) {
      // respond with status 404 and error message
      res.status(404).json(err)
    }
  })
  .get('/userPost/:userId', async (req, res) => {
    try {
      const userId = req.params.userId

      const userFound = await User.find({ _id: userId })

      if (!userFound) {
        res.status(404).json('User is not registerd')
      }
      // fetch all posts from db
      const userPosts = await Post.find({ user: userId })

      if (!userPosts) {
        res.status(404).json(`${userFound.name} dose not have anu y posts yet`)
      }
      res.status(200).json(userPosts)
      // respond with status 200 and posts
    } catch (err) {
      // respond with status 404 and err msg
      res.status(404).json(err)
    }
  })
  // define DELETE endpoint for deleting a single user post
  .delete('/delete/:id', async (req, res) => {
    // extract post ID from request params
    const id = req.params.id
    try {
      const post = await Post.findById(id)

      // find post by ID and delete it
      if (!post) {
        res.status(404).json({ message: 'Post not found.' })
      } else {
        // this deletes any image uploads to cloudinary as well
        await cloudinary.uploader.destroy(`user_posts/${post.user}/post`)
        // this deletes the post data from mongoDB
        await Post.deleteOne({ _id: id })
        res.status(201).json('Post deleted.')
      }
    } catch (err) {
      // respond with status 500 and err msg
      res.status(500).json(err)
    }
  })
  // define PATCH endpoint for updating aspects of a single user post
  .patch('/patch/:id', async (req, res) => {
    // extract post ID from request params
    const id = req.params.id
    try {
      // before we can update we still MUST find the post first
      const post = await Post.findById(id)
      // one way to doit : user id will be checked from cookies and if the id is in the like array the user will not be able to lilke the post
      // if the post was not found, respond with err msg
      if (!post) {
        res.status(404).json({ message: 'Post not found.' })
        // else update the found post modularly
      } else {
        // findOneAndUpdate detects every field of the post and allows updating them
        await Post.findOneAndUpdate(
          { _id: id },
          {
            $set: {
              title: req.body.title || post.title,
              description: req.body.description || post.description,
              mediaUrl: req.file ? req.file.path : post.mediaUrl,
              tags: req.body.tags || post.tags,
              likes: req.body.likes || post.likes,
            },
          }
        )
        // respond with OK status and msg
        res.status(200).json({ message: 'Post edited.' })
      }
    } catch (err) {
      // respond with status 500 and err msg
      res.status(500).json({ message: err.message })
    }
  })
  .patch('/like', postliked)

module.exports = router
