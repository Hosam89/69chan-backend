// import dependencies
const User = require('../models/User');

// controller for fetching all current users
module.exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        if (!users) {
            throw new Error(`404: No users found in db collection!`);
        };
        res.status(200).json(`200: Users found in db collection: ${users}`);
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
        next(err);
    };
};

// controller for fetching a single user by id
module.exports.getUserById = async (req, res, next) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error(`404: No user with such an id found!`);
        };
        res.status(200).json(`200: User found by id: ${user}`);
    } catch {
        next(err);
    };
};

// controller for updating a single user modularly
module.exports.updateUser = async (req, res, next) => {
    const id = req.params.id;
    try {
        const user = await User.findByIdAndUpdate(id, req.body, { new: true });
        if (!user) {
            throw new Error(`404: No user with such an id found!`);
        };
        res.status(200).json(`200: User updated successfully: ${user}`);
    } catch {
        next(err);
    };
};
