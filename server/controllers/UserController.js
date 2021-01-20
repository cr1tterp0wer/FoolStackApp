const User = require('../db/models/User');
const bcrypt = require('bcrypt');
const { createHashValidation } = require('../db/models/HashValidation');
const Joi = require('@hapi/joi');
const mongooseErrorHandler = require('mongoose-error-handler');
const SALT_ROUNDS = 12;

// Param validation schema
const schema = Joi.object({
  email: Joi.string().trim().required(),
  password:  Joi.string().trim().required().min(6).max(50),
  username: Joi.string().trim().required().min(6).max(50)
});

/**
 * Generates a password digest with bcrypt
 * @param {String} password - Users plaintext password
 * @return {String} hashed password
 */
const digestPassword = (password) => {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
}

/**
 * Creates a user in the DB
 * @param {Object} - user data obj
 * @return {Object} - the new user object
 */
const createUser = async (req, res, next) => {

  try {
    const params = await schema.validateAsync(req.body);
    params.password = digestPassword(params.password);

    const user = await new User({
      createdAt: new Date(),
      email: params.email,
      password_digest: params.password,
      username: params.username
    }).save().then((query) => {
      createHashValidation(query._id);
      res.status(200).json({ success: true, msg: query });
    }).catch((error) => {
        res.status(400).json({ success: false, msg: mongooseErrorHandler.set(error, req.t) }); 
    });

  } catch (error) {
    return next(error);
  }

}

/**
 * Destroys all posts within the database
 * @return {Object} - the Mongoose response
 */
async function deleteAllUsers() {
  const retval = await User.deleteMany({});
  return retval;
}

module.exports = {
  createUser,
  deleteAllUsers
}
