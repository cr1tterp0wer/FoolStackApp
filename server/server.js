/* eslint-disable no-console */

require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require('express-session');
const redirectLoop = require('express-redirect-loop');
const morgan = require("morgan");
const socketIO = require("socket.io");
const APIRouter = require("./routes/api");

const { HOST } = process.env;
const { CLIENT_HOST } = process.env;
const { VUE_PORT } = process.env;
const { PORT } = process.env;

const SERVER_URL = `${HOST}:${PORT}`;
const CLIENT_URL = process.env.CLIENT_URL
	? process.env.CLIENT_URL
	: `${CLIENT_HOST}:${VUE_PORT}`;

// Middleware
app.use(
  session({
    secret: 'test',
    resave: false,
    saveUninitialized: true
  })
);
app.use(redirectLoop({
  defaultPath: '/',
  maxRedirects: 5
}));

morgan("tiny");
app.use(express.urlencoded({ extended: false}));
app.use(cors({ 
  credentials: true,
  origins: [CLIENT_URL, `${CLIENT_URL}/`, 'http://localhost:8080', 'http://localhost:8080/', 'http://localhost'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaaders:['Authorization', 'Content-Type']
}));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
	res.io = io; // eslint-disable-line no-use-before-define
	next();
});

app.get("/healthz", (req, res) => {
	res.status(200).json({message: 'ok'});
});

app.use("/api", APIRouter);

const server = app.listen(PORT, () => {
	console.log(`Server started on ${SERVER_URL}`);
});

const io = socketIO(server, {
	cors: {
		allowedHeaders: ["Authorization", "Content-Type"],
		credentials: true,
    origins: [CLIENT_URL, `${CLIENT_URL}/`, 'http://localhost:8080', 'http://localhost:8080/', 'http://localhost'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
		transports: ["websocket", "polling"],
	},
	allowEIO3: true,
});

io.on("connection", (socket) => {
	console.log("Client connected");
	socket.on("disconnect", () => console.log("Client disconnected"));
});

const users = {};
socket.on('login', function(data){
	console.log('a user ' + data.userId + ' connected');
	// saving userId to object with socket ID
	users[socket.id] = data.userId;
});

socket.on('disconnect', function(){
	console.log('user ' + users[socket.id] + ' disconnected');
	// remove saved socket from users object
	delete users[socket.id];
});

