// import dependencies
const User = require('../models/User')
const bcrypt = require('bcrypt')
const cloudinary = require('cloduinary').v2
const { CloudinaryStorage } = require(',ulter-storage-cloudinary')
const multer = require('multer')
require('dotenv').config()

// set up cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

// set up multer and cloudinary storage engine
storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pictures',
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

// controller for user signup
module.exports.signup = async (req, res, next) => {
  try {
    // retrieve user from db by email provided in request body
    const foundUser = await User.findOne({ email: req.body.email })
    // check if foundUser already exists in db
    if (foundUser) {
      res
        .status(409)
        .json({ message: `409: Email already in use. Please choose another.` })
    }
    // generate salt and hash for the user password
    const salt = bcrypt.genSaltSync(Number(SALT_ROUND))
    const hash = bcrypt.hashSync(req.body.password, salt)
    // create a new user object from user model
    const newUser = new User({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      password: hash,
      profilePicture: req.file.path,
    })
    await newUser.save() // save the new user object to the database
    // upload the profile picture to cloudinary storage
    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: `profile_pictures/${newUser._id}`,
    })
    newUser.profilePicture = result.secure_url
    await newUser.save() // update newUser with the profilePicture URL
    // respond with the newly created user object
    res
      .status(201)
      .json({ message: `201: User created successfully!`, user: newUser })
  } catch (err) {
    next(err)
  }
}
