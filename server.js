// import dependencies
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');

// import routes (modules)
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');
const authRoute = require('./routes/authRoute');

const app = express(); // initialize express

// import middlewares
const { connectMongoDB } = require('./lib/mongoose'); // destruct mongoDB connector
const { errorHandler } = require('./middlewares/errorHandler'); // destruct errorHandler

// allow requests from specified origins with specific methods
const whitelist = [process.env.FRONTEND_URL, 'https://www.arii.me'];

// add cors options
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('CORS issues'));
    };
  },
  credentials: true,
};

// enable cross-origin resource sharing with specified options for the express app
app.use(cors(corsOptions));

// parse incoming cookies and make them accessible in req.cookies
app.use(cookieParser());

// enable parsing of incoming JSON data in the request body by the express app
app.use(express.json());

// define routes
app.use('/users', userRoute);
app.use('/posts', postRoute);
app.use('/auth', authRoute);

// define middlewares
connectMongoDB();
app.use(errorHandler); // error handler must be last invoked middleware

// listen to server
app.listen(process.env.PORT || 3003, () => {
  console.log(`Server up and running at ${process.env.PORT}`);
});