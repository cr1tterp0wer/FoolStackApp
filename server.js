/* eslint-disable no-console */
require('dotenv').config();
const secure = require('ssl-express-www');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const history = require('connect-history-api-fallback');

const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || 8888;
const CLIENT_PORT = process.env.VUE_PORT || 8080;
const SOCKET_PORT = process.env.SOCKET_PORT || 8999;
const socketIO = require("socket.io");
const io = socketIO(SOCKET_PORT, {
  cors: {
    origin: `${HOST}:${CLIENT_PORT}`,
    methods: ['GET', 'POST'],
    allowedHeaders: ['content-type'],
  }
});

console.log(io);
console.log(`${HOST}:${CLIENT_PORT}`);

const CORS_OPTS = {
  credentials: true,
  origin: [`${HOST}:${CLIENT_PORT}`, 'http://localhost:8080'],
  optionSuccessStatus: 200 // for legacy browsers, ie WINBLOWS
};

morgan('tiny');

// Middleware
app.use(secure);
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
