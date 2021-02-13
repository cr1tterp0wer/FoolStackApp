const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const MUUID = require('uuid-mongodb');
const User = require('./User');
const TTL = parseInt(process.env.SESSION_TTL_DAYS);
const Joi = require('@hapi/joi');

require('../connection');
MUUID.mode('relaxed');

// UserCreate Param validation schema
const validateTokenParams = Joi.object({
  token: Joi.string().guid()
});

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
 * @return {Promise}
 */
SessionSchema.statics.deleteSessionByToken = async (sessionID) => {
  const uuid = MUUID.from(sessionID);
  return Session.deleteOne({ _id: uuid });
};

/**
 * Validates user token via TLL and updated_at fields
 * @param {Mongodb.ID} sessionID - session id
 * @return {Promise}
 */
SessionSchema.statics.validateToken = async (sessionID) => {
  const params = validateTokenParams.validate({token: sessionID});
  const { value, error } = params,
        valid = error == null;

  if (!valid) {
    return false;
  } else {
    const uuid = MUUID.from(sessionID);
    const session = await Session.findOne({ _id: uuid });

    if (session) {
      const userSession = await SessionSchema.statics.getUserBySession(sessionID);

      if (userSession.user) {
        const now = new Date();
        let ttl = new Date();
        ttl.addDays(TTL);

        const updateData  = {
          $set: {
            updatedAt: now,
            expiry: ttl,
          }
        };

        return Session.updateOne({ _id: session._id }, updateData);
      } else {
        return Session.deleteOne({ _id: session._id })
      }
    } else {
      return false;
    }
  }
};

/**
 * Finds and returns a user given a token
 * @param {Mongodb.ID} sessionID - session id
 * @return {Mongodb.Model} user
 */
SessionSchema.statics.getUserBySession = async (sessionID) => {
  const uuid = MUUID.from(sessionID);
  return Session.findOne({ _id: uuid }).populate('user');
};

/**
 * Finds and returns a session given a token
 * @param {Mongodb.ID} sessionID - session id
 * @return {Mongodb.Model} session
 */
SessionSchema.statics.getSessionByToken = async (sessionID) => {
  const uuid = MUUID.from(sessionID);
  return Session.findOne({ _id: uuid });
};

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;
