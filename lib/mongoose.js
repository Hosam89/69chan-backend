// import dependencies
const mongoose = require('mongoose');
require('dotenv').config();

// destruct envs
const { DB_USER, DB_PASS, DB_HOST, DB_NAME } = process.env;

// atlas connection string
const mongoURI = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;

// middleware function for handling connections to the mongoDB atlas database
module.exports.connectMongoDB = async () =>{
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to MongoDB Atlas!`);
    } catch (err) {
        console.log(`Couldn't Connect to MongoDB Atlas!`);
        next(err);
    }
}
