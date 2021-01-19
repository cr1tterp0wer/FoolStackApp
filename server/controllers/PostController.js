const Post = require('../db/models/Post');

/**
 * Fetches all posts from the db using Post model
 * @return {Array} - a list of post objects
 */
function getAllPosts() {
  return Post.find();
}

/**
 * Creates a post in the DB
 * @return {Object} - the new post object
 */
async function createPost(post) {
  const newPost = new Post({
    text: post.text,
    createdBy: post.createdBy,
    createdAt: new Date(),
    comments: [],
  });
  const retval = await newPost.save();
  return retval; // socket emitter
}

/**
 * Deletes a specific post in the DB with given id
 * @param postId {Integer} - the post id of the target
 * @return {Object} - the Mongoose response
 */
async function deletePost(postId) {
  const retval = await Post.deleteOne({ _id: postId });
  return retval;
}

/**
 * Create a new comment to a specific Post
 * @param postId {Integer} - the post id of the target
 * @param comment {Object} - the comment data
 * @return {Object} - the Mongoose response
 */
async function addPostComment(postId, comment) {
  const retval = await Post.updateOne(
    { _id: mongoose.Types.ObjectId(postId) },
    { $push: { comments: { ...comment, createdAt: new Date() } } },
  );
  return retval;
}

/**
 * Destroys all posts within the database
 * @return {Object} - the Mongoose response
 */
async function deleteAllPosts() {
  const retval = await Post.deleteMany({});
  return retval;
}

module.exports = {
  getAllPosts,
  createPost,
  deletePost,
  addPostComment,
  deleteAllPosts,
};
