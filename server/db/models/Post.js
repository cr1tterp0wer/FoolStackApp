const mongoose = require('mongoose');
require('../connection');
const CommentSchema = require('./Comment');
const LikeSchema = require('./Like');

const PostSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdBy: { type: String, required: true }, // should be ObjectId later
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date },
  comments: [CommentSchema],
  likes: [LikeSchema],
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
