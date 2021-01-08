/* eslint-disable no-console */
const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost/NuSocial';

// mongoose.connect(connectionString, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

const database = mongoose.connection;

database.on('error', console.error.bind(console, 'connection error:'));
database.once('open', () => {
  console.log(`mongoose successful connection to ${connectionString}`);
});
