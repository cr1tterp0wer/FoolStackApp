/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const history = require('connect-history-api-fallback');

const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.WEB_PORT || 8888;
const CLIENT_PORT = process.env.VUE_PORT || 8080;
const SOCKET_PORT = process.env.SOCKET_PORT || 8999;

const CORS_OPTS = {
  credentials: true,
  origin: [`${HOST}:${CLIENT_PORT}`, 'http://localhost:8080'],
  optionSuccessStatus: 200 // for legacy browsers, ie WINBLOWS
};

morgan('tiny');

// Middleware
app.use(bodyParser.json());
app.use(cors());
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

server.listen(SOCKET_PORT, () => {
  console.log(`server started on ${SOCKET_PORT}`);
});

io.on('connection', (socket) => {
  console.log('client connected');
});
