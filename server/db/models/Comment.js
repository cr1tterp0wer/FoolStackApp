const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  text: { type: String, required: true },
  createdBy: { type: String, required: true }, // changes to ObjectId once user is made
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date },
  likes: [ObjectId],
});

module.exports = CommentSchema;
