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
function addPostComment(userId, postId, text, createdBy) {
  return new Promise((resolve, reject) => {
    const createdAt = new Date();
    const commentTemp = {
      userId, text, createdBy, createdAt,
    };
    Post.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(postId) },
      { $push: { comments: commentTemp } },
      { new: true },
    ).select({
      comments: {
        $elemMatch: {
          userId, text, createdBy, createdAt,
        },
      },
    }).then((newComment) => {
      resolve(newComment);
    }).catch((error) => {
      reject(error);
    });
  });
}

/**
 * Create a new comment to a specific Post
 * @param postId {Integer} - the post id of the target
 * @param comment {Object} - the comment data
 * @return {Object} - the Mongoose response
 */
function editPostComment(commentId, userId, postId, text) {
  return new Promise((resolve, reject) => {
    const updatedTemp = new Date();
    Post.findById(postId).select({
      comments: {
        $elemMatch: {
          _id:commentId, userId, //userId validates ownership
        },
      },
    }).then((result) => {
      const comment = result.comments[0];
      comment.text = text;
      result.save().then((res) => {
        const commentor = res.comments[0];
        commentor.updatedAt = updatedTemp;
        res.save().then((fin) => {
          resolve(fin);
        }).catch((error) => {
          reject(error);
        });
      }).catch((error) => {
        reject(error);
      });
    }).catch((error) => {
      reject(error);
    });
  });
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
  editPostComment,
};
