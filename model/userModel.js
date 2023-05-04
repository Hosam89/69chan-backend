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

// usually you do it this way but we save twice because of cloudinary upload of profile pic
// this causes the hash to occur twice, which in return falsifies our password
// hash and salt user password before saving to database
// UserSchema.pre("save", async function (next) {
// const salt = await bcrypt.genSalt();
// this.password = await bcrypt.hash(this.password, salt);
// next();
// });

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
