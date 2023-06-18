// import dependencies
const express = require('express')
const postController = require('../controllers/postController')

// create new router object
const router = express.Router()

// import controllers
router.post('/add', postController.uploadmediaUrl, postController.addSinglePost)
router.get('/:id', postController.getSinglePost)
router.get('/', postController.tagSearch)
router.get('/userPost/:userId', postController.getUserPosts)
router.delete('/delete/:id', postController.deleteSinglePost)
router.patch('/patch/:id', postController.updateSinglePost);
router.patch('/like', postController.likePost);

module.exports = router
