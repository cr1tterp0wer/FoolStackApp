require('../../helpers/dateTime.js');
const { ObjectId } = require('mongodb');
const MUUID = require('uuid-mongodb');
const mongoose = require('mongoose');
const HASH_VALIDATION_TTL_DAYS = parseInt(process.env.HASH_VALIDATION_TTL_DAYS);

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

/**
 * Creates a new email validation hash given a new userID
 * @param {Mongodb.ID} userID - new user id
 * @return {*}
 */
HashValidationSchema.methods.createHashValidation = (userID) => {
  let date = new Date();
  date.addDays(HASH_VALIDATION_TTL_DAYS);

  return new HashValidationModel({
    userID: userID,
    expiry: date
  }).save();
};

/**
 * Deletes a hash validation given a userID
 * @param {Mongodb.ID} userID - new user id
 * @return {*}
 */
HashValidationSchema.methods.deleteHashValidation = async (userID, hash) => {
  const uuid = MUUID.from(hash);
  return HashValidationModel.deleteOne({ userID: userID, _id: uuid });
}

/**
 * Deletes all hashes matching a given userID
 * @param {Mongodb.ID} userID - new user id
 * @return {*}
 */
HashValidationSchema.methods.deleteAllUserHashes = async (userID) => {
  return HashValidationModel.deleteMany({ userID: userID  });
}

/**
 * Retrieves one hash by index {User.id|HashValidation.id}
 * @param {Mongodb.ID} userID - new user id
 * @return {*}
 */
HashValidationSchema.methods.getHash = async (userID, hash) => {
  const uuid = MUUID.from(hash);
  return HashValidationModel.findOne({ userID: userID, _id: uuid  });
}

const HashValidationModel = mongoose.model('HashValidation', HashValidationSchema);
const HashValidation = new HashValidationModel();

module.exports = HashValidation;
