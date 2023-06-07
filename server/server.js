/* eslint-disable no-console */

require("dotenv").config();
const secure = require("ssl-express-www");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const history = require("connect-history-api-fallback");

const { HOST } = process.env;
const { PORT } = process.env;

morgan("tiny");

// Middleware
app.use(secure);
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.urlencoded({ extended: false }));

const APIRouter = require("./routes/api");

app.use((req, res, next) => {
	res.io = io; // eslint-disable-line no-use-before-define
	next();
});

app.use("/api",
	APIRouter);
app.use(history());
app.use(express.static("../client/dist/"));

app.get("/",
	(req, res) => {
		res.sendFile("../client/dist/index.html");
	});

const server = app.listen(PORT,
	() => {
		console.log(`Server started on ${HOST}`);
	});
const socketIO = require("socket.io");
const io = socketIO(server,
	{
		cors: {
			allowedHeaders: [
				"authorization",
				"content-type"
			],
			credentials: true,
			origin: HOST,
			methods: [
				"GET",
				"POST"
			],
			transports: [
				"websocket",
				"polling"
			],
		},
		allowEIO3: true,
	});

io.on("connection",
	(socket) => {
		console.log("Client connected");
		socket.on("disconnect",
			() => console.log("Client disconnected"));
	});
