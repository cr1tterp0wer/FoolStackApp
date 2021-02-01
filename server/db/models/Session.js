const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const MUUID = require('uuid-mongodb');
require('../connection');

// use id/uuid as session-token
const SessionSchema = new mongoose.Schema({
    _id: { type: 'object', value: { type: 'Buffer' }, default: ()=> MUUID.v1() },
    user: {
      type: ObjectId, required: true,
      ref: 'User'
    },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    TTL: { type: Date, required: true}, 
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
 * Finds a user by SessionID
 * @param {Mongodb.ID} sessionID - session id
 * @return {Mongodb.Model} user
 */
SessionSchema.methods.validateUserBySession = (sessionID) => {
  let user;
  let userSession = Session.findOne({ _id: MUUID.from(sessionID) }).then((query) => {
    user = query.user;
  }).catch((error) => {
    console.log(error);
  });

  return user;
};

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;
