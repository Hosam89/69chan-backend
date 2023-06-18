// import dependencies
const express = require('express')
const authController = require('../controllers/authController')
const authHandler = require('../middlewares/authHandler')

// create new router object
const router = express.Router()

// import controllers
router.post('/signup', authController.uploadProfilePicture, authController.signup)
router.post('/login', authController.login)
router.get('/logout', authHandler.checkUser, authController.logout)

module.exports = router
