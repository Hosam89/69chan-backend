// import dependencies
const express = require('express');
const authController = require('../controllers/authController');
const authHandler = require('../middlewares/authHandler');

// create new router object
const router = express.Router();

// import controllers
router.post('/signup', authController.uploadProfilePicture, authController.signup);
router.post('/login', authController.login);
router.get('/logout', authHandler.checkUser, authController.logout);

// these two are not important and will only get done if I feel like it, lul
// router.post('/forgot-pw', authController.forgotPassword)
// router.patch('/reset-pw/:token', authController.resetPassword)

module.exports = router;
