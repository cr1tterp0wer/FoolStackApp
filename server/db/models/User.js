// model of user
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const Sessions = require("./Sessions")

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  pwDigest: { type: String, required: true, unique: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date }, // use this as the boolean for whether or not they validated email
  sessions: [Sessions.SessionSchema],
  username: {type: String, required: true, unique:true }
});

module.exports = UserSchema;