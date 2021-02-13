const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
require('../connection');
const { CommentSchema } = require('./Comment');
const LikeSchema = require('./Like');

const PostSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  userID: { type: ObjectId, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date },
  comments: [CommentSchema],
  likes: [LikeSchema],
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
