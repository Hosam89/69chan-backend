// import dependencies
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cors = require('cors');
const dotenv = require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const { multerStorageCloudinary } = require('multer-storage-cloudinary');
const socketio = require('socket.io');

// import models
const Post = require('../model/postModel');

// destruct envs
const { CLOUD_NAME, API_KEY, API_SECRET, SALT_ROUND } = process.env;

// set up cloudinary configuration
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

// set up multer and cloudinary storage engine
storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: `user_posts`,
    format: async (req, file) => {
      let format;
      // set allowed file formats here
      switch (file.mimetype) {
        case "image/jpeg":
          format = "jpg";
          break;
        case "image/png":
          format = "png";
          break;
        case "image/gif":
          format = "gif";
          break;
        default:
          format = "jpg";
          break;
      }
      return format;
    },
  },
});

// set up multer middleware for handling file uploads
const upload = multer({ storage: storage });

// create new router object
const route = express.Router();

// Note: Routes are added in order of complexity as it's considered best practice

// define POST endpoint for user posts
route
    .post('/add', upload.single('mediaUrl'), async (req, res) => {
        // create a new post object from Post model
        const newPost = new Post({
            title: req.body.title,
            description: req.body.description,
            mediaUrl: req.file.path,
            user: req.body.user,
            comments: req.body.comments,
            likes: req.body.likes,
            tags: req.body.tags
        })
        try {
            await newPost.save();
 
            const result = await cloudinary.uploader.upload(req.file.path, {
                public_id: `user_posts/${newPost.user}/post`,
            });

            newPost.mediaUrl = result.secure_url;
            await newPost.save();

            res.status(201).json(newPost);

        } catch (err) {
            // catch errors and send status 302 response with thrown error msg
            res.status(302).json({ message: err.message });
        }
    })
    // define GET endpoint for retrieving a single user post
    .get('/:id', async ( req, res) => {
        // extract post ID from request params
        const id = req.params.id;
        try {
            // attempt post retrieval by ID
            const post = await Post.find({ _id: id });
            // respond with status 200 and post data
            res.status(200).json(post);
        } catch (err) {
            // respond with status 404 and err msg
            res.status(404).json(err);
        }
    });

// define route handler for GET request on root endpoint
route
    .get('/', async (req, res) => {
        try {
            // fetch all posts from db 
            const posts = await Post.find();
            res.status(200).json(posts);
            // respond with status 200 and posts
            res.status(200).json;
        } catch (err) {
            // respond with status 404 and err msg
            res.status(404).json(err);
        }
    });

// add update and delete routes for posts and users
// use params etc. entirely ignore updateusermodel

module.exports = route;