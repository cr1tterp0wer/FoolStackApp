const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const MUUID = require('uuid-mongodb');
const NOT_FRIEND = 0;
const REQUESTED = 1;
const PENDING  = 2;
const ACCEPTED = 3;

MUUID.mode('relaxed');

const FriendSchema = new mongoose.Schema({
  requester: { type: ObjectId, ref: 'User' },
  recipient: { type: ObjectId, ref: 'User' },
  _chatID: { type: 'object', value: { type: 'Buffer' }, default: () => MUUID.v1() },
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
FriendSchema
  .virtual('chatID')
  .get(() => {
    return MUUID.from(this._chatID).toString();
  })
  .set((value) => {
    this._chatID = MUUID.from(value);
  });

const Friend = mongoose.model('Friend', FriendSchema);

module.exports = Friend;
