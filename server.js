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

// import routes (modules)
const userRoute = require('./routes/userRoute');

// initialize express
const app = express();

// destruct envs
const { DB_USER, DB_PASS, DB_HOST, DB_NAME, PORT, FRONTEND_URL } = process.env;

// atlas connection string
const mongoURI = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;

// connect to mongoDB atlas
const main = async() => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB Atlas!');
    } catch (err) {
        console.log('Couldnt connect to MongoDB Atlas!', err);
    };
};
main();

// enable cross-origin resource sharing for the express app
app.use(cors());
// allow requests from specified origins with specific methods
app.use(
    cors({
      origin: FRONTEND_URL,
      methods: "GET,POST,PUT,DELETE",
    // enable reception of cookies and other auth credentials in req/res
      credentials: true,
    })
  );

  // enable parsing of incoming JSON data in the request body by the express app
app.use(express.json());

// use created routes (modules)
app.use("/users", userRoute);

// listen to server
app.listen(PORT || 3003, () => {
    console.log(`Server up and running at ${PORT}`);
});