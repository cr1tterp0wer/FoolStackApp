require('dotenv');
const Joi = require('@hapi/joi');
const nodemailer = require('nodemailer');
const mongooseErrorHandler = require('mongoose-error-handler');
const HashValidation = require('../db/models/HashValidation');
const User = require('../db/models/User');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '8888';

// UserCreate Param validation schema
const userCreateParams = Joi.object({
  email: Joi.string().trim().required(),
  password: Joi.string().trim().required().min(6)
    .max(50),
  username: Joi.string().trim().required().min(6)
    .max(50),
});

// UserRegister Param validation schema
const userRegisterParams = Joi.object({
  userID: Joi.string().trim().required(),
  vhs: Joi.string().guid(),
});

/**
 * Send Mail verification from NU social gmail accnt
 * @param {String} email - to email
 * @param {String} hash - validation hash
 * @param {String} userID - the new users ID
 * @return {*}
 */
const sendMailValidation = (email, hash, userID) => {
  // The url must include the http protocol or the email link will not render~
  const URL = `${HOST}:${PORT}/api/users/register?userID=${userID}&vhs=${hash}`;

  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: 'nusocial.contact@gmail.com',
    to: email,
    subject: 'Register NU Social Account',
    html: `${'<html><body>'
        + '<h3>Click the link to complete your NU Social Account validation</h3>'
        + '<a href="'}${URL}">${URL}</a>`
        + '</body></html>',
  };

  transport.sendMail(message, (err/* , info */) => {
    if (err) {
      /* eslint-disable no-console */
      console.log(err);
    }
  });
};

/**
 * GET: /users/register
 * Registers/Registers the new user by
 * removing the hash validation(s) from the db
 * @param {Object} - the validation data
 * @return {*}
 */
const usersRegister = async (req, res) => {
  let params = {
    userID: req.query.userID,
    vhs: req.query.vhs,
  };

  // Register params
  params = await userRegisterParams.validateAsync(params);

  const user = await User.findOne({ _id: params.userID });
  const updateData = { updatedAt: new Date() };

  HashValidation.deleteHashValidation(params.userID).then((query) => {
    // If it deleted a hashValidation: update user
    if (query.deletedCount) {
      user.updateOne(updateData).then((data) => {
        res.status(200).json({ success: true, msg: data });
      }).catch((error) => {
        res.status(400).json({ success: false, msg: error });
      });
    } else { // If hashValidation not found, send error
      res.status(400).json({ success: false, msg: 'User cannot be validated' });
    }
  }).catch((error) => {
    res.status(400).json({ success: false, msg: error });
  });
};

/**
 * POST: /users/new
 * Creates a user in the DB
 * @param {Object} - user data obj
 * @return {Object} - the new user object
 */
const usersNew = async (req, res /* next */) => {
  const params = await userCreateParams.validateAsync(req.body);
  const user = new User({
    createdAt: new Date(),
    email: params.email,
    username: params.username,
  });
  user.password_digest = user.digestPassword(params.password);

  user.save().then((/* userStatus */) => {
    HashValidation.createHashValidation(user._id).then((query) => {
      sendMailValidation(params.email, query._id, query.userID);
      res.status(200).json({ success: true, msg: query });
    }).catch((error) => {
      res.status(400).json({ success: false, msg: error });
    });
  }).catch((error) => {
    res.status(400).json({ success: false, msg: mongooseErrorHandler.set(error, req.t) });
  });
};

/**
 * Destroys all users within the database
 * @return {Object} - the Mongoose response
 */
async function deleteAllUsers() {
  const retval = await User.deleteMany({});
  return retval;
}

module.exports = {
  usersNew,
  usersRegister,
  deleteAllUsers,
};
