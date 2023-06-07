/* eslint-disable no-console */

require("dotenv").config();
const secure = require("ssl-express-www");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const history = require("connect-history-api-fallback");
const socketIO = require("socket.io");

const { HOST } = process.env;
const { CLIENT_HOST } = process.env;
const { VUE_PORT } = process.env;
const { PORT } = process.env;

const SERVER_URL = `${HOST}:${PORT}`;
const CLIENT_URL = process.env.CLIENT_URL ?? `${CLIENT_HOST}:${VUE_PORT}`;

morgan("tiny");

// Middleware
app.use(secure);
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: [CLIENT_URL] }));
app.use(bodyParser.urlencoded({ extended: false }));

const APIRouter = require("./routes/api");

app.use((req, res, next) => {
	res.io = io; // eslint-disable-line no-use-before-define
	next();
});

app.use("/api", APIRouter);
app.use(history());

const server = app.listen(PORT, () => {
	console.log(`Server started on ${SERVER_URL}`);
});

const io = socketIO(server, {
	cors: {
		allowedHeaders: ["authorization", "content-type"],
		credentials: true,
		origin: CLIENT_URL,
		methods: ["GET", "POST"],
		transports: ["websocket", "polling"],
	},
	allowEIO3: true,
});

io.on("connection", (socket) => {
	console.log("Client connected");
	socket.on("disconnect", () => console.log("Client disconnected"));
});
