const mongoose = require('mongoose');
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
 * Create a new like to a specific Post
 * @param postId {String} - the post id of the target
 * @param userId {String} - the comment data
 * @resolve {Object} - the Mongoose response
 * @reject {Object} - mongoose response error
 */
function addPostLike(postId, userId) {
  return new Promise((resolve, reject) => {
    // TODO: unsure if we should check that the user has not already liked
    // TODO : or guard on front-end only
    const likeObj = { userId, createdAt: new Date() };
    Post.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(postId) },
      { $push: { likes: likeObj } },
      { new: true },
    ).select({ likes: { $elemMatch: { userId } } }).then((newLike) => {
      resolve(newLike);
    }).catch((error) => {
      reject(error);
    });
  });
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
  addPostLike,
};
