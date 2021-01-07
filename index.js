/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// MORGAN for logging
const history = require('connect-history-api-fallback');

const app = express();
// const server = require('http').createServer(app);
// const io = require('socket.io')(server);

// Middleware
app.use(bodyParser.json());
app.use(cors());

const APIRoute = require('./server/routes/api');

app.use('/api', APIRoute);

// io.on('connection', (socket) => {
//   console.log('a user connected');
//   // log any disconnects
//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });
//   // handle a createPost event
//   socket.on('New Post', (post) => {
//     io.emit('New Post', post);
//     console.log(`post:  ${post}`);
//   });
// });
app.use(history());
app.use(express.static('./client/dist/'));
app.get('/', (req, res) => {
  res.sendFile('/client/dist/index.html');
});

const listenPort = process.env.PORT || 3000;
app.listen(listenPort, () => {
  console.log(`Server started on port ${listenPort} on host:`);
});
// app.listen(port, () => console.log(`Server started on port ${port}`));
