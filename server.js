// import dependencies
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cors = require('cors');
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const { multerStorageCloudinary } = require('multer-storage-cloudinary');
const socketio = require('socket.io');

// import routes (modules)
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');

const app = express(); // initialize express

// import middlewares
const { connectMongoDB } = require('./lib/mongoose'); // destruct mongoDB connector
const { errorHandler } = require('./middlewares/errorHandler'); // destruct errorHandler

const { PORT, FRONTEND_URL } = process.env; // destruct envs



// COMMENTED OUT CONNECTION FOR FALLBACK IF CONNECTION HANDLER FAILS
// // atlas connection string
// const mongoURI = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;

// // connect to mongoDB atlas
// const main = async() => {
//     try {
//         await mongoose.connect(mongoURI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         console.log('Connected to MongoDB Atlas!');
//     } catch (err) {
//         console.log('Couldnt connect to MongoDB Atlas!', err);
//     };
// };
// main();



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

// define routes
app.use('/users', userRoute);
app.use('/posts', postRoute);
// app.use('/auth', authRoute);


// define middlewares
connectMongoDB();
app.use(errorHandler); // error handler must be last invoked middleware

// listen to server
app.listen(PORT || 3003, () => {
    console.log(`Server up and running at ${PORT}`);
});