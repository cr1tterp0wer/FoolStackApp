const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
require('../connection');
const Comments = require('./Comments');

const PostSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdBy: { type: String, required: true }, // should be ObjectId later
  createdAt: { type: Date, required: true },
  updatedAt: {type: Date},
  comments: [Comments.CommentSchema],
  likes: [ObjectId], // users ID
});

const Post = mongoose.model('Post', PostSchema);

/** ***************** CRUD OPERATIONS ON POSTS ************************* */
function getAllPosts() {
  return Post.find();
}

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

async function deletePost(postId) {
  const retval = await Post.deleteOne({ _id: postId });
  return retval;
}

async function addPostComment(postId, comment) {
  const retval = await Post.updateOne(
    { _id: mongoose.Types.ObjectId(postId) },
    { $push: { comments: { ...comment, createdAt: new Date() } } },
  );
  return retval;
}

// editPostComment

/* CAUTION: Dangerous */
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
