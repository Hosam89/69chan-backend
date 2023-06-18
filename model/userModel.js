const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  username: { type: String },
  profilePicture: { type: String },
})

// usually you hash/salt inside the appropriate model; like our userModel here.
//
// but we save the user-object twice for following two reasons:
// - the regular data of the user-object gets saved to our mongoDB atlas database.
// - and the profile picture gets uploaded and saved in an appropriate folder to cloudinary.
//
// this triggers the password hash twice, which in return falsifies the user password on login attempt.
// therefore we ignore the code snippet below and directly salt and hash in our authController.
//
// hash and salt user password before saving to database
// UserSchema.pre("save", async function (next) {
// const salt = await bcrypt.genSalt();
// this.password = await bcrypt.hash(this.password, salt);
// next();
// });

// pre-hook for updating password field
UserSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate()
  if (update.password) {
    bcrypt.hash(update.password, Number(process.env.SALT_ROUND), function (err, hash) {
      if (err) return next(err)
      update.password = hash
      next()
    })
  }
})

// compare the password entered by the user with the hashed password in the database
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err) //cb(err) passes errors down to error handler the same way next(err) does
    cb(null, isMatch)
  })
}

const User = mongoose.model("User", UserSchema)

module.exports = User
