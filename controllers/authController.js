// import dependencies
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// setting the maximum age of the token to 3 days in seconds
const maxAge = 3 * 24 * 60 * 60;

// function to create a cookie with the signed token
const createCookie = (id) => {
    // signing the token with the user's ID, a secret key, and an expiration time of maxAge seconds
    return jwt.sign({ id }, "secret powerful key", {
        expiresIn: maxAge,
    });
};