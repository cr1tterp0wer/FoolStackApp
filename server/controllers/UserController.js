const User = require('../db/models/User');
const Joi = require('@hapi/joi');
const mongooseErrorHandler = require('mongoose-error-handler');

const schema = Joi.object({
  email: Joi.string().trim().required(),
  password:  Joi.string().trim().required().min(6).max(50),
  username: Joi.string().trim().required()
});


/**
 * Creates a user in the DB
 * @param {Object} - user data obj
 * @return {Object} - the new user object
 */
const createUser = async (req, res, next) => {

  try {
    const params = await schema.validateAsync(req.body);

    const user = await new User({
      createdAt: new Date(),
      email: params.email,
      password_digest: params.password,
      username: params.username
    }).save().then((query) => {
      res.status(200).json({ success: true, msg: query });
    }).catch((err) => {
        res.status(400).json({ success: false, msg: mongooseErrorHandler.set(err, req.t) }); 
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
