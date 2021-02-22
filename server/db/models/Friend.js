require('dotenv');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const NOT_FRIEND = 0;
const REQUESTED = 1;
const PENDING  = 2;
const ACCEPTED = 3;

const FriendSchema = new mongoose.Schema({
  requester: { type: ObjectId, ref: 'User' },
  recipient: { type: ObjectId, ref: 'User' },
  status: {
    type: Number,
    enums: [
      NOT_FRIEND, 
      REQUESTED,
      PENDING,
      ACCEPTED
    ]
  },
}, { timestamps: true });

const Friend = mongoose.model('Friend', FriendSchema);

module.exports = Friend;
