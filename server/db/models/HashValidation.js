const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const require('../../helpers/dateTime.js');

const HASH_VALIDATION_TTL_DAYS = 7;

const HashValidationSchema = new mongoose.Schema({
  _id: { type: String, default: uuid.v1 },
  userId: { type: ObjectId, required: true },
  expiry: { type: Date, required: true }
});

const HashValidationModel = mongoose.model('HashValidation', HashValidationSchema);

const createHashValidation = async (userID) => {
  let date = new Date();
  date.add(HASH_VALIDATION_TTL_DAYS);

  try {
    new HashValidationModel({
      userID: userID,
      expiry: date
    }).save();
  } catch(error) {
    return error;
  }

}

const removeHashValidation = async (userID) => {
  HashValidation.find({ userID: userID }).remove().exec();
}

module.exports = {
  createHashValidation,
  deleteHashValidation
};
