const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const MUUID = require('uuid-mongodb');
const PERSONAL_CHAT = 0;
const GENERAL_CHAT = 1;

MUUID.mode('relaxed');

const ChatMessageSchema = new mongoose.Schema({
  _chatID: { type: 'object', value: { type: 'Buffer' } },
  message: { type: String, required: true },
  userID: { type: ObjectId, ref: 'User' },
  channel: {
    type: Number,
    enums: [
      PERSONAL_CHAT,
      GENERAL_CHAT
    ]
  }
}, { timestamps: true });

ChatMessageSchema
  .virtual('chatID')
  .get(() => {
    return MUUID.from(this._chatID).toString();
  })
  .set((value) => {
    this._chatID = MUUID.from(value);
  });

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

module.exports = ChatMessage;
