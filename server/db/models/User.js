require('dotenv');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  password_digest: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date }, // use this as the boolean for whether or not they validated email
  username: { type: String, required: true, unique: true },
});

/**
 * White list certain values so we don't expose 
 * sensitive data to front-end
 */
UserSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    var retJson = {
      id: ret._id,
      email: ret.email,
      firstname: ret.firstname,
      lastname: ret.lastname,
      username: ret.username
    };
    return retJson;
  }
});

/**
 * Generates a password digest with bcrypt
 * @param {String} password - Users plaintext password
 * @return {String} hashed password
 */
UserSchema.methods.digestPassword = (password) => {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
};

/**
 * Generates a password digest with bcrypt
 * @param {String} password - Users plaintext password
 * @return {String} hashed password
 */
UserSchema.statics.digestPassword = (password) => {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
};

/**
 * Generates a password digest with bcrypt
 * @param {String} password - Users plaintext password
 * @return {String} hashed password
 */
UserSchema.methods.validatePassword = (password, passwordDigest) => {
  return bcrypt.compareSync(password, passwordDigest);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
