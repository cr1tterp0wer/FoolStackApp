require('dotenv');
const Joi = require('@hapi/joi');
const nodemailer = require('nodemailer');
const mongooseErrorHandler = require('mongoose-error-handler');
const User = require('../db/models/User');
const Session = require('../db/models/Session');
const TTL = parseInt(process.env.SESSION_TTL_DAYS);

// SessionLogin Param validation schema
const sessionLoginParams = Joi.object({
  email: Joi.string().trim().required(),
  password: Joi.string().trim().required().min(6)
    .max(50)
});

/**
 * POST: /auth/new
 * Creates a new session in the DB
 * @param {Object} - user creds data obj
 * @return {Object} - the new session object
 */
const sessionsNew = async (req, res) => {
  const params = sessionLoginParams.validate(req.body);
  const validParams = { value, error } = params,
        valid = error == null;

  if (!value) {
    res.status(422).json({ success: false, message: error.details[0].message })
  } else {
    const userModel = new User();

    User.findOne({ email: value.email }).then((userStatus) => {

      if (!userStatus || !userStatus.updatedAt) {
        res.status(403).json({ success: false, message: 'Invalid Username/Password'});
      } else {
        let validPass = userModel.validatePassword(value.password, userStatus.password_digest);
        if (validPass) {
          let today = new Date();
          let ttl = new Date();
          ttl.addDays(TTL);

          let session = new Session({
            user: userStatus,
            expiry: ttl,
            createdAt: today,
            updatedAt: today
          });
          session.save().then((sessionStatus) => {
            res.status(200).json({ 
              success: true, 
              token: sessionStatus._id,
              user: userStatus,
            });
          }).catch((error) => {
            res.status(403).json({ success: false, message: mongooseErrorHandler.set(error, req.t) });
          });
        } else {
          res.status(403).json({ success: false, message: 'Invalid Username/Password'});
        }
      }
    }).catch((error) => {
      res.status(400).json({ success: false, message: error });
    });
  }
};

/**
 * POST: /auth/destroy
 * Creates a new session in the DB
 * @param {Object} - session token obj
 * @return {Object} - the new session object
 */
const sessionsDestroy = async (req, res) => {
  const token = req.headers['authorization'];
  const session = new Session();

  session.deleteSessionByToken(token).then((deleteData) => {
    if (deleteData.deletedCount) {
      res.status(200).json({ success: true, message: 'Successfully logged out ' });
    } else {
      res.status(200).json({ success: true, message: 'User already logged out' });
    }
  }).catch((error) => {
    res.status(400).json({ success: false, message: mongooseErrorHandler.set(error, req.t) });
  });

};

module.exports = {
  sessionsNew,
  sessionsDestroy
};
