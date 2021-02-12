const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const LikeSchema = require('./Like');

const CommentSchema = new mongoose.Schema({
  userID: { type: ObjectId, required: true },
  text: { type: String, required: true },
  author: { type: String, required: true }, // changes to ObjectId once user is made
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date },
  likes: [LikeSchema],
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = { 
  CommentSchema,
  Comment
};
