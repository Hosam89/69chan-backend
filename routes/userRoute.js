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
const socketio = require('socket.io');

// import models
const User = require('../model/userModel');

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
    folder: "profile_pictures",
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

// define POST endpoint for signing up a new user to db
route
    .post('/signup', upload.single('profilePicture'), async (req, res) => {
        // generate salt and hash for the user password
        const salt = bcrypt.genSaltSync(Number(SALT_ROUND));
        const hash = bcrypt.hashSync(req.body.password, salt);
        // create a new user object from User model
        const newUser = new User({
            username: req.body.username,
            name: req.body.name,
            email: req.body.email,
            password: hash,
            profilePicture: req.file.path
        })
        try {
            // retrieve user from db using their email provided in request body
            const foundUser = await User.find({ email: req.body.email});
            // check if foundUser already exists in db
            if (foundUser.length === 0) {
                // if foundUser doesn't exist, save new user object (newUser) to db
                await newUser.save();
                // upload profilePicture to cloudinary with user ID as public ID
                const result = await cloudinary.uploader.upload(req.file.path, {
                    public_id: `profile_picture_${newUser._id}`,
                });
                // update newUser with profilePicture URL
                newUser.profilePicture = result.secure_url;
                await newUser.save();
                // respond with the newly created user object
                res.status(201).json(newUser);
            } else {
                // if foundUser already exists, throw error message
                throw new Error('Email is already in use. Please choose another!');
            }
        } catch (err) {
            // catch errors and send status 302 response with thrown error msg
            res.status(302).json({ message: err.message });
        }
    })
    // define POST endpoint for logging in an existing user on db
    .post('/login', async (req, res) => {
        const userPassword = req.body.password;
        const userEmail = req.body.email;
        try {
            // extract user email and password from request body
            // retrieve a single user from db with email provided in request body
            const foundUser = await User.findOne({ email: userEmail });
            // if foundUser doesn't exist in db, throw error msg
            if (!foundUser) {
                throw new Error('No user found with this email address!');
            }
            // compare foundUser password with password stored in db
            const isPasswordMatch = await bcrypt.compare(userPassword, foundUser.password);
            // if passwords match, respond with status 200 and user data
            if (isPasswordMatch) {
                res.status(200).json(foundUser);
            } else {
                // if passwords don't match, throw error msg
                throw new Error('The password you entered is incorrect!');
            }
        } catch (err) {
            // catch errors and send status 302 response with thrown error msgs
            res.status(302).json({ message: err.message });
        }
    });

// define GET endpoint for retrieving a single user by ID
route
    .get('/:id', async ( req, res) => {
        // extract user ID from request params
        const id = req.params.id;
        try {
            // attempt user retrieval by ID
            const user = await User.find({ _id: id });
            // respond with status 200 and user data
            res.status(200).json(user);
        } catch (err) {
            // respond with status 404 and err msg
            res.status(404).json(err);
        }
    });

// define route handler for GET request on root endpoint
route
    .get('/', async (req, res) => {
        try {
            // fetch all users from db 
            const users = await User.find();
            res.status(200).json(users);
            // respond with status 200 and users
            res.status(200).json;
        } catch (err) {
            // respond with status 404 and err msg
            res.status(404).json(err);
        }
    });

module.exports = route;
