const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
require('../connection');
const CommentSchema = require('./Comment');

const PostSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdBy: { type: String, required: true }, // should be ObjectId later
  createdAt: { type: Date, required: true },
  updatedAt: {type: Date},
  comments: [CommentSchema],
  likes: [ObjectId], // users ID
});

const PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel;