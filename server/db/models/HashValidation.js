require('../../helpers/dateTime.js');
const { ObjectId } = require('mongodb');
const MUUID = require('uuid-mongodb');
const mongoose = require('mongoose');
const HASH_VALIDATION_TTL_DAYS = 7;

const HashValidationSchema = new mongoose.Schema({
  _id: { type: 'object', value: { type: 'Buffer' }, default: ()=> MUUID.v1() },
  userID: { type: ObjectId, required: true },
  expiry: { type: Date, required: true }
});

// Disable the default id & generate a virtual accr
HashValidationSchema.set('id', false);
HashValidationSchema
  .virtual('id')
  .get(() => {
    return MUUID.from(this._id).toString();
  })
  .set((value) => {
    this._id = MUUID.from(value);
  });

const HashValidationModel = mongoose.model('HashValidation', HashValidationSchema);

/**
 * Creates a new email validation hash given a new userID
 * @param {Mongodb.ID} userID - new user id
 * @return {*}
 */
const createHashValidation = async (userID) => {
  let date = new Date();
  date.addDays(HASH_VALIDATION_TTL_DAYS);

  let model = await new HashValidationModel({
    userID: userID,
    expiry: date
  }).save().then((query) => {
    return query;
  }).catch((error) => {
    return error;
  });
}

/**
 * Removes a specified hash given a new userID
 * @param {Mongodb.ID} userID - new user id
 * @return {*}
 */
const removeHashValidation = async (userID) => {
  HashValidation.find({ userID: userID }).remove().exec();
}

module.exports = {
  createHashValidation,
  removeHashValidation
};
