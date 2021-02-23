/* eslint-disable no-console */
require('dotenv').config();
const secure = require('ssl-express-www');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const history = require('connect-history-api-fallback');

const HOST = process.env.HOST;
const PORT = process.env.PORT;
const SOCKET_PORT = process.env.SOCKET_PORT;

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    credentials: true,
    origin: 'http://localhost:8080'
  }
});

morgan('tiny');

// Middleware
app.use(secure);
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.urlencoded({ extended: false }));

const APIRouter = require('./server/routes/api');

app.use((req, res, next) => {
  res.io = io;
  next();
});

app.use('/api', APIRouter);
app.use(history());
app.use(express.static('./client/dist/'));

app.get('/', (req, res) => {
  res.sendFile('/client/dist/index.html');
});

app.listen(PORT, () => {
  console.log(`Server started on ${HOST}:${PORT}`);
});

io.on('connection', (socket) => { 
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});
server.listen(SOCKET_PORT, () => {
  console.log(`socket.io server listening on: ${SOCKET_PORT}`);
});
