const Post = require('../model/postModel')

module.exports.tagSearch = async (req, res, next) => {
  if (req.query.tag) {
    try {
      const tag = req.query.tag
      const posts = await Post.find()
      const matchingPosts = posts.filter((post) => post.tags.includes(tag))

      res.status(200).json(matchingPosts)
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Error searching by tag', error })
    }
  } else {
    next()
  }
}
