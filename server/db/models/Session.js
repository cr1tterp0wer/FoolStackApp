const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const MUUID = require('uuid-mongodb');
require('../connection');

MUUID.mode('relaxed');
// use id/uuid as session-token
const SessionSchema = new mongoose.Schema({
    _id: { type: 'object', value: { type: 'Buffer' }, default: ()=> MUUID.v4() },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    expiry: { type: Date, required: true}, 
    user: {
      type: ObjectId, required: true,
      ref: 'User'
    },
});

// Disable the default id & generate a virtual accr
SessionSchema.set('id', false);
SessionSchema
  .virtual('id')
  .get(() => {
    return MUUID.from(this._id).toString();
  })
  .set((value) => {
    this._id = MUUID.from(value);
  });

 /** 
  * Finds and deletes a session given a token
 * @param {Mongodb.ID} sessionID - session id
 * @return {Mongodb.Model} user
  */
SessionSchema.methods.deleteSessionByToken = async (sessionID) => {
  let uuid = MUUID.from(sessionID);
  return Session.deleteOne({ _id: uuid });
};

/**
 * Finds and returns a session given a token
 * @param {Mongodb.ID} sessionID - session id
 * @return {Mongodb.Model} user
 */
SessionSchema.methods.validateUserBySession = async (sessionID) => {
  let uuid = MUUID.from(sessionID);
  return Session.findOne({ _id: uuid });
};

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;
