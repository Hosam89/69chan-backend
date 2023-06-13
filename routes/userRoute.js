// import dependencies
const express = require('express');
const userController = require('../controllers/userController');
const { userSearch } = require('../controllers/userController');

// create new router object
const router = express.Router();

// import controllers
router.delete('/:id', userController.deleteUser);

module.exports = router;
