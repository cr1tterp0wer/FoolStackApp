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
  email: Joi.string().trim().regex(/^([a-zA-Z0-9]|-|.|_|)*@([a-zA-Z0-9])*.nu.edu/).required(),
  firstname: Joi.string().trim().required(),
  lastname: Joi.string().trim().required(),
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

// UserRevaliate Param validation schema
const userRevalidateParams = Joi.object({
  email: Joi.string().trim().regex(/^([a-zA-Z0-9]|-|.|_|)*@([a-zA-Z0-9])*.nu.edu/).required(),
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
 * POST: /users/revalidate
 * Resends the new user an email validation link
 * @param {Object} - the validation data
 * @return {*}
 */
const usersRevalidate = async (req, res) => {
  // Register params
  params = userRevalidateParams.validate(req.body);
  const validParams = { value, error } = params,
        valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error.details[0].message })
  } else {
    User.findOne({ email: value.email }).then((userStatus) => {

    if (!userStatus) {
      res.status(422).json({ success: false, message: 'Email not found'});
    } else {

      HashValidation.createHashValidation(userStatus._id).then((hashStatus) => {
        sendMailValidation(value.email, hashStatus._id, hashStatus.userID);
        res.status(200).json({ success: true, message: 'Email sent' });
      }).catch((error) => {
        res.status(400).json({ success: false, message: error });
      });

    }
   });
  }
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
  params = userRegisterParams.validate(params);
  const validParams = { value, error } = params,
        valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error })
  } else {
    const user = await User.findOne({ _id: value.userID });
    const updateData = { updatedAt: new Date() };

    HashValidation.deleteHashValidation(value.userID).then((query) => {
      // If it deleted a hashValidation: update user
      if (query.deletedCount) {
        user.updateOne(updateData).then((data) => {
          res.status(200).json({ success: true, message: data });
        }).catch((error) => {
          res.status(400).json({ success: false, message: error });
        });
      } else { // If hashValidation not found, send error
        res.status(400).json({ success: false, message: 'User cannot be validated' });
      }
    }).catch((error) => {
      res.status(400).json({ success: false, message: error });
    });
  }
};

/**
 * POST: /users/new
 * Creates a user in the DB
 * @param {Object} - user data obj
 * @return {Object} - the new user object
 */
const usersNew = async (req, res, next) => {
  const params = userCreateParams.validate(req.body);
  const validParams = { value, error } = params,
        valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error.details[0].message })
  } else {
    const user = new User({
      createdAt: new Date(),
      email: value.email,
      firstname: value.firstname,
      lastname: value.lastname,
      username: value.username,
    });

    user.password_digest = user.digestPassword(value.password)

    user.save().then((userStatus) => {

      HashValidation.createHashValidation(userStatus._id).then((hashStatus) => {
        sendMailValidation(value.email, hashStatus._id, hashStatus.userID);
        res.status(200).json({ success: true, message: 'Email sent' });
      }).catch((error) => {
        res.status(400).json({ success: false, message: error });
      });

    }).catch((error) => {
      if (error.code == 11000) {
        res.status(400).json({ success: false, message: 'User exists! Check your email for validation!' });
      } else {
        res.status(400).json({ success: false, message: mongooseErrorHandler.set(error, req.t) });
      }
    });
  }

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
  usersRevalidate,
  deleteAllUsers,
};
