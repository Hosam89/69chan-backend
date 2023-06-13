// import dependencies
const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const jwt = require("jsonwebtoken");

// set up cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
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
                case 'image/jpeg':
                    format = 'jpg';
                    break;
                case 'image/png':
                    format = 'png';
                    break;
                case 'image/gif':
                    format = 'gif';
                    break;
                default:
                    format = 'jpg'
                    break;
            }
            return format;
        },
    },
});

// set up multer middleware for handling file uploads
const upload = multer({ storage: storage });

// define cloudinary folder where profile pictures will be uploaded to
module.exports.uploadProfilePicture = upload.single('profilePicture');

// controller for user signup
module.exports.signup = async (req, res, next) => {
    try {
        // retrieve user from db by email provided in request body
        const foundUser = await User.findOne({ email: req.body.email });
        console.log(foundUser);
        // check if foundUser already exists in db
        if (foundUser) {
            res.status(409).json({ message: `Email already in use. Please choose another.` });
        }
        // generate salt and hash for the user password
        const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUND));
        const hash = bcrypt.hashSync(req.body.password, salt);
        // create a new user object from user model
        const newUser = new User({
            username: req.body.username,
            name: req.body.name,
            email: req.body.email,
            password: hash,
            profilePicture: req.file.path,
        });
        await newUser.save(); // save the new user object to the database
        // upload the profile picture to cloudinary storage
        const result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `profile_pictures/${newUser._id}`,
        });
        newUser.profilePicture = result.secure_url;
        await newUser.save(); // update newUser with the profilePicture URL
        console.log(newUser);
        // generate a signup token
        const token = jwt.sign({ newUserId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '5m' // expires in 5 minutes (in case signup was erroneous)
        });
        // store the token as a cookie
        res.cookie('jwt', token, {
            httpOnly: true
        });
        // respond with the newly created user object and the created token
        res.status(201).json({ message: `User created successfully!`, user: newUser, token });
    } catch (err) {
        next(err);
    };
};

// controller for user login
module.exports.login = async(req, res, next) => {
    const userPassword = req.body.password;
    const userEmail = req.body.email;
    console.log(userEmail);
    console.log(req.body);
    try {
        // extract user email and password from request body
        // retrieve a single user from db with email provided in request body
        const foundUser = await User.findOne({ email: userEmail });
    if (!foundUser) {
        throw new Error('No user found with this email address!');
    };
    // compare foundUser password with password stored in db
    const isPasswordMatch = await bcrypt.compare(userPassword, foundUser.password);
    // if passwords match, respond with status 200 and user data
    if (isPasswordMatch) {
        // generate a login token
        const token = jwt.sign({ userId: foundUser._id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
        });
        // store the token as a cookie
        res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // expires in 1 day
        });
        res.status(200).json({ message: 'Login successful.', foundUser, token });
    } else {
        // if passwords don't match, throw error msg
        throw new Error('The password you entered is incorrect!');
    };
    } catch (err) {
        next(err);
    };
};

// controller for user logout
module.exports.logout = async (req, res, next) => {
    try {
        // clear the JWT cookie by setting it to an empty string and expiring it immediately
        res.cookie('jwt', '', { expires: new Date(0) });
        res.status(200).json({ message: 'Logout successful.' });
    } catch (err) {
        next(err);
    }
};