const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  createdAt: { type: Date, required: true },
});

module.exports = LikeSchema;
