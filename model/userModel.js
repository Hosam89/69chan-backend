const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  username: { type: String },
  profilePicture: { type: String },
});

// hash and salt user password before saving to database
UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.hash(user.password, Number(process.env.SALT_ROUND), function (err, hash) {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

// pre-hook for updating password field
UserSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.password) {
    bcrypt.hash(update.password, Number(process.env.SALT_ROUND), function (err, hash) {
      if (err) return next(err);
      update.password = hash;
      next();
    });
  };
});

// compare the password entered by the user with the hashed password in the database
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
