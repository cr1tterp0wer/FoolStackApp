require('dotenv');
const Joi = require('@hapi/joi');
const nodemailer = require('nodemailer');
const mongooseErrorHandler = require('mongoose-error-handler');
const User = require('../db/models/User');
const Session = require('../db/models/Session');
const TTL = parseInt(process.env.SESSION_TTL_DAYS);

// SessionLogin Param validation schema
const sessionLoginParams = Joi.object({
  username: Joi.string().trim().required().min(6)
    .max(50),
  password: Joi.string().trim().required().min(6)
    .max(50)
});

const sessionLogoutParams = Joi.object({
  username: Joi.string().trim().required().min(6)
    .max(50)
});

/**
 * POST: /auth/new
 * Creates a new session in the DB
 * @param {Object} - user creds data obj
 * @return {Object} - the new session object
 */
const sessionsNew = async (req, res) => {
  const params = await sessionLoginParams.validateAsync(req.body);
  const userModel = new User();

  await User.findOne({ username: params.username }).then((query) => {
    let validPass = userModel.validatePassword(params.password, query.password_digest);

    if (validPass) {
      let today = new Date();
      let ttl = new Date();
      ttl.addDays(TTL);

      let session = new Session({
        user: query,
        TTL: ttl,
        createdAt: today,
        updatedAt: today
      });

      session.save().then((query) => {
        res.status(200).json({ success: true, token: query._id });
      }).catch((error) => {
        res.status(403).json({ success: false, msg: mongooseErrorHandler.set(error, req.t) });
      });
    } else {
      res.status(403).json({ success: false, msg: 'Invalid Password'});
    }
  }).catch((error) => {
    res.status(400).json({ success: false, msg: error });
  });

};

/**
 * POST: /auth/destroy
 * Creates a new session in the DB
 * @param {Object} - session token obj
 * @return {Object} - the new session object
 */
const sessionsDestroy = async (req, res) => {
  const params = await sessionLogoutParams.validateAsync(req.body);

  await User.findOne({ username: params.username }).then((query) => {
    Session.deleteMany({ user: query }).then((deleteData) => {
      if (deleteData.deletedCount) {
        res.status(200).json({ success: true, msg: 'Successfully logged out user_' + query._id });
      } else {
        res.status(200).json({ success: true, msg: 'User already logged out' });
      }
    }).catch((error) => {
      res.status(400).json({ success: false, msg: mongooseErrorHandler.set(error, req.t) });
    });
  }).catch((error) => {
    res.status(400).json({ success: false, msg: mongooseErrorHandler.set(error, req.t) });
  });
};

module.exports = {
  sessionsNew,
  sessionsDestroy
};
