const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const HashValidateSchema = new mongoose.Schema({
    hash: {type: String, required: true}, // needs to be a url safe 64bit string
    userId: { type: ObjectId, required: true },
    expiry: {type: Date, required: true}
});


module.exports = HashValidateSchema;