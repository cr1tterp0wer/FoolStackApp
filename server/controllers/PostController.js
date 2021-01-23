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
function addPostComment(postId, text, createdBy) {
  return new Promise((resolve, reject) => {
    const createdAt = new Date();
    const commentTemp = {text, createdBy, createdAt };
    Post.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(postId) },
      { $push: { comments: commentTemp } },
      { new: true },
    ).select({comments: { $elemMatch: { text, createdBy, createdAt } } }).then((newComment) => {
      resolve(newComment);
    }).catch((error) => {
      reject(error);
    });
  });
}

function addPostLike(postId, userId) {
  return new Promise((resolve, reject) => {
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
