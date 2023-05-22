const User = require("../model/authModel");
const jwt = require("jsonwebtoken");

// setting the maximum age of the token to 3 days in seconds
const maxAge = 3 * 24 * 60 * 60;

// function to create a cookie with the signed token
const createCookie = (id) => {
    // signing the token with the user's ID, a secret key, and an expiration time of maxAge seconds
    return jwt.sign({ id }, "secret powerful key", {
        expiresIn: maxAge,
    });
};

module.exports.checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(
      token,
      "super secret key",
      async (err, decodedToken) => {
        if (err) {
          res.json({ status: false });
          next();
        } else {
          const user = await User.findById(decodedToken.id);
          if (user) res.json({ status: true, user: user.email });
          else res.json({ status: false });
          next();
        }
      }
    );
  } else {
    res.json({ status: false });
    next();
  }
};
