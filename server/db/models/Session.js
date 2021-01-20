const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    token: {type: String, required: true},
    createdAt: { type: Date, required: true },
    expiry: { type: Date }, 
});

module.exports = SessionSchema;
