// const { ObjectId } = require('mongodb');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, required: true },
  likes: [ObjectId],
});

module.exports = {
  CommentSchema,
};
