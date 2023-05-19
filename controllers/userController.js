// import dependencies
const User = require('../model/userModel')

// controller for fetching all current users
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
    if (!users) {
      throw new Error({ message: `404: No users found in db collection!` })
    }
    res
      .status(200)
      .json({ message: `200: Users found in db collection: ${users}` })
  } catch (err) {
    // forwards the error to the errorHandler and finally to the error stack trace.
    // the error stack trace is a detailed report of the call stack at the point of error occurrence.
    // it shows the order in which functions were called and where the error occurred in that call sequence.
    // its generated automatically when an error occurs and includes info like: file name, line number, function calls etc.
    // the strongest part of catching errors this way is the context it provides for function calls that lead to the error.
    // the error block you see in vscode console when your code crashes is a good example for error stacking.
    // our errors are prepared this way so that we can feed them through our errorHandler middleware later.
    // we will create that errorHandler in our middlewares folder and then import/register it to our server.js.
    // since we're forwarding errors, we must register the errorHandler as the very last middleware.
    next(err)
  }
}

module.exports.userSearch = async (req, res, next) => {
  if (req.query.user) {
    try {
      const userName = req.query.user
      const users = await User.find()
      const matchingUsers = users.filter((user) => user.name.includes(userName))

      res.status(200).json(matchingUsers)
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Error searching by user Name', error })
    }
  } else {
    next()
  }
}

// controller for fetching a single user by id
module.exports.getUserById = async (req, res, next) => {
  const id = req.params.id
  try {
    const user = await User.findById(id)
    if (!user) {
      throw new Error({ message: `404: No user with such an id found!` })
    }
    res.status(200).json({ message: `200: User found by id: ${user}` })
  } catch (err) {
    next(err)
  }
}

// controller for updating a single user modularly
module.exports.updateUser = async (req, res, next) => {
  const id = req.params.id
  try {
    const user = await User.findById(id)
    if (!user) {
      throw new Error({ message: `404: No user with such an id found!` })
    } else {
      await User.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            name: req.body.name || user.name,
            email: req.body.email || user.email,
            username: req.body.username || user.username,
            profilePicture: req.file ? req.file.path : user.profilePicture,
          },
        }
      )
      res
        .status(200)
        .json({ message: `200: User updated successfully: ${user}` })
    }
  } catch (err) {
    next(err)
  }
}

// controller for deleting a single user from db
module.exports.deleteUser = async (req, res, next) => {
  const id = req.params.id
  try {
    const user = await User.findById(id)
    console.log(user)
    if (!user) {
      throw new Error({ message: `404: No user with such an id found!` })
    } else {
      await cloudinary.uploader.destroy(`profile_picture/${user._id}`)
      await User.deleteOne({ _id: id })
      res.status(201).json({ message: 'User deleted. Bye Felicia... o(TヘTo)' })
    }
  } catch (err) {
    next(err)
  }
}
