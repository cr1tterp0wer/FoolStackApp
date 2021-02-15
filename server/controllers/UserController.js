require('dotenv');
const Joi = require('@hapi/joi');
const nodemailer = require('nodemailer');
const mongooseErrorHandler = require('mongoose-error-handler');
const HashValidation = require('../db/models/HashValidation');
const User = require('../db/models/User');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '8888';
const ENVIRONMENT = process.env.ENVIRONMENT || 'PROD';
const BASE_URL = (ENVIRONMENT == 'DEV') ? `${HOST}:${PORT}` : HOST;

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

// REST ENDPOINTS

/**
 * POST: /users/new
 * Creates a user in the DB
 * @param {Object} - user data obj
 * @return {Object} - the new user object
 */
const usersNew = async (req, res, next) => {
  const params = userCreateParams.validate(req.body);
  const { value, error } = params,
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
        const title = 'Register NU Social Account';
        const body = 'Click the link to complete your NU Social Account validation';

        sendMailValidation(value.email, 'register', hashStatus._id, hashStatus.userID, title, body);
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
 * POST: /revalidate
 * Resends the new user an email validation link
 * @param {Object} - the validation data
 * @return {*}
 */
const usersRevalidate = async (req, res) => {
  // Register params
  const params = userRevalidateParams.validate(req.body);
  const { value, error } = params,
        valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error.details[0].message })
  } else {
    User.findOne({ email: value.email }).then((userStatus) => {

    if (!userStatus) {
      res.status(422).json({ success: false, message: 'Email not found'});
    } else {
      HashValidation.createHashValidation(userStatus._id).then((hashStatus) => {
        const title = 'Register NU Social Account';
        const body = 'Click the link to complete your NU Social Account validation';

        sendMailValidation(value.email,'register', hashStatus._id, hashStatus.userID, title, body);
        res.status(200).json({ success: true, message: 'Email sent' });
      }).catch((error) => {
        res.status(400).json({ success: false, message: error });
      });

    }
   });
  }
};

/**
 * GET: /register
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
  const { value, error } = params,
        valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error })
  } else {
    const user = await User.findOne({ _id: value.userID });
    const updateData = { updatedAt: new Date() };

    HashValidation.deleteHashValidation(value.userID, value.vhs).then((query) => {
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
 * POST: /reset-password
 * Begins the password reset process by
 * adding a password reset hash in the User Model
 * and sending an email validation
 * @param {Object} - the validation data
 * @return {*}
 */
const resetPassword = (req, res) => {
  // Register params
  const params = userRevalidateParams.validate(req.body);
  const { value, error } = params,
        valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error })
  } else {
    User.findOne({ email: value.email }).then((userStatus) => {
      if (!userStatus) {
        res.status(422).json({ success: false, message: 'Email not found' });
      } else {
        HashValidation.createHashValidation(userStatus._id).then((hashStatus) => {
          const title = 'NU Social Account Password Reset Request';
          const body = 'Click the link to temporarily reset your password to: ' + hashStatus._id;

          sendMailValidation(value.email, 'validate-password', hashStatus._id, hashStatus.userID, title, body);
          res.status(200).json({ success: true, message: 'Email sent' });
        }).catch((error) => {
          res.status(400).json({ success: false, message: error });
        });
      }
    });
  }
};

/**
 * GET: /validate-password
 * Resets user password to the hash value
 * @param {Object} - the validation data
 * @return {*}
 */
const validatePassword = async (req, res) => {
  let params = {
    userID: req.query.userID,
    vhs: req.query.vhs,
  };

  // Register params
  params = userRegisterParams.validate(params);
  const { value, error } = params,
        valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error })
  } else {
    const user = await User.findOne({ _id: value.userID });
    const updateData = {
      updatedAt: new Date(),
      password_digest: user.digestPassword(value.vhs)
    };

    HashValidation.deleteHashValidation(value.userID, value.vhs).then((query) => {
      // If it deleted a hashValidation: update user
      if (query.deletedCount) {
        user.updateOne(updateData).then((data) => {
          res.status(200).json({ success: true, message: data });
        }).catch((error) => {
          res.status(400).json({ success: false, message: error });
        });
      } else { // If hashValidation not found, send error
        res.status(400).json({ success: false, message: 'Cannot be reset' });
      }
    }).catch((error) => {
      res.status(400).json({ success: false, message: error });
    });
  }
};

// SERVER ACTIONS

/**
 * Destroys all users within the database
 * @return {Object} - the Mongoose response
 */
async function deleteAllUsers() {
  const retval = await User.deleteMany({});
  return retval;
}

/**
 * Send Mail verification from NU social gmail accnt
 * @param {String} email - to email
 * @param {String} hash - validation hash
 * @param {String} userID - the new users ID
 * @return {*}
 */
const sendMailValidation = (email, stub, hash, userID, title, body) => {
  // The url must include the http protocol or the email link will not render~
  const URL = `${BASE_URL}/api/${stub}?userID=${userID}&vhs=${hash}`;

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
    subject: title,
    html: `${'<html><body>'
        + '<h3>'+ body +'</h3>'
        + '<a href="'}${URL}">${URL}</a>`
        + '</body></html>',
  };

  transport.sendMail(message, (err/* , info */) => {
    if (err) {
      /* eslint-disable no-console */
      console.log("this is the spot", err);
    }
  });
};

module.exports = {
  resetPassword,
  validatePassword,
  usersNew,
  usersRegister,
  usersRevalidate,
};
