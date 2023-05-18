const Post = require('../model/postModel')

module.exports.searchQuary = async (req, res) => {
  try {
    const tag = req.query.tag
    const posts = await Post.find()
    const matchingPosts = posts.filter((post) => post.tags.includes(tag))

    res.status(200).json(matchingPosts)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error searching by tag', error })
  }
}
