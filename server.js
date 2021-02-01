/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const history = require('connect-history-api-fallback');

morgan('tiny');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const APIRoute = require('./server/routes/api');

app.use('/api', APIRoute);
app.use(history());
app.use(express.static('./client/dist/'));
app.get('/', (req, res) => {
  res.sendFile('/client/dist/index.html');
});

const listenPort = process.env.PORT;
const listenHost = process.env.HOST;
app.listen(listenPort, () => {
  console.log(`Server started on ${listenHost}:${listenPort}`);
});

