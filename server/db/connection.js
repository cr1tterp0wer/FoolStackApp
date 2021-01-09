/* eslint-disable no-console */
require('dotenv');
const mongoose = require('mongoose');

// const connectionString = 'mongodb://localhost/NuSocial';
const connectionString = process.env.DB_CONNECTION_STRING;
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useFindAndModify: false,
  // useCreateIndex: true,
});

const database = mongoose.connection;

database.on('error', console.error.bind(console, 'connection error:'));
database.once('open', () => {
  console.log(`mongoose successful connection to ${connectionString}`);
});
