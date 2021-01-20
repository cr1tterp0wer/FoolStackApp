const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Sessions = require("./Session");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_digest: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date }, // use this as the boolean for whether or not they validated email
  sessions: [Sessions],
  username: { type: String, required: true, unique: true }
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
