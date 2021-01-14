// model of user
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const Sessions = require("./Sessions")

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  pwDigest: { type: String, required: true, unique: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date }, // use this as the boolean for whether or not they validated email
  sessions: [Sessions.SessionSchema],
  username: {type: String, required: true, unique:true }
});

// createNewUser(){
//     // 1. see if the user is already in the db (email exists already) do find on user w/ some email
//     // 2. if no account already --> 
//     //  create the user w/ a boolean set to false
//     // save the hash w/ the user id 
//     // save send email with a unique hash 
// }

module.exports = {
  UserSchema,
};
