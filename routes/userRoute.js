// import dependencies
const express = require('express')
const userController = require('../controllers/userController')

// create new router object
const router = express.Router()

// import controllers
router.get('/', userController.getAllUsers)
router.get('/search', userController.userSearch)
router.get('/:id', userController.getUserById)
router.patch('/:id', userController.updateUser)
router.delete('/:id', userController.deleteUser)

module.exports = router
