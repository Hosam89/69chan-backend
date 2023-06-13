// import dependencies
const Post = require('../model/postModel')

// controller for searching posts
module.exports.tagSearch = async (req, res, next) => {
  if (req.query.tag) {
    try {
      const tag = req.query.tag;
      const posts = await Post.find();
      const matchingPosts = posts.filter((post) => post.tags.includes(tag));
      res.status(200).json(matchingPosts);
    } catch (err) {
      res.status(500).json({ message: 'Error searching by tag', err });
      next(err);
    };
  } else {
    next();
  };
};

// controller for liking posts
module.exports.postliked = async (req, res, next) => {
  const { userId, postId } = req.body;
  try {
    const likedPost = await Post.findById(postId);
    console.log('post', likedPost);
    if (likedPost.likes.includes(userId)) {
      throw new Error('User Alreday liked the post');
    } else {
      likedPost.likes.push(userId);
      console.log('likes', likedPost.likes);
      await likedPost.save();
    };
  } catch (err) {
    next(err);
  };
};


