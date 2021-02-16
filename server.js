/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const history = require('connect-history-api-fallback');

const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || 8888;
const CLIENT_PORT = process.env.VUE_PORT || 8080;

const CORS_OPTS = {
  origin: `${HOST}:${CLIENT_PORT}`,
  optionSuccessStatus: 200 // for legacy browsers, ie WINBLOWS
};

morgan('tiny');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const APIRouter = require('./server/routes/api');

app.use('/api', APIRouter);
app.use(history());
app.use(express.static('./client/dist/'));

app.get('/', (req, res) => {
  res.sendFile('/client/dist/index.html');
});

app.listen(PORT, () => {
  console.log(`Server started on ${HOST}:${PORT}`);
});
