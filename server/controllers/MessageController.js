const Joi = require("@hapi/joi");
Joi.objectID = require("joi-objectid")(Joi);
const Friend = require("../db/models/Friend");
const ChatMessage = require("../db/models/ChatMessage");
const ACCEPTED = 3;

const messageGetParams = Joi.object({
	userID: Joi.objectID().required(),
	friendID: Joi.objectID().required(),
	channel: Joi.number()
		.integer()
		.min(0)
		.max(1)
		.required(),
});

const messagePostParams = Joi.object({
	userID: Joi.objectID().required(),
	friendID: Joi.objectID().required(),
	message: Joi.string()
		.trim()
		.required(),
	channel: Joi.number()
		.integer()
		.min(0)
		.max(1)
		.required(),
});

/**
 * Gets all chat messages from users or general chat
 */
const messages = async (req, res) => {
	const params = messageGetParams.validate(req.query);
	const { value, error } = params,
		valid = error == null;

	if (!valid) {
		res.status(422).json({ success: false, message: error.details[0].message });
	} else {
		// Check if they are friends. if not error;
		Friend.findOne({
			recipient: value.userID,
			requester: value.friendID,
			status: ACCEPTED,
		})
			.then((friendship) => {
				if (!friendship) {
					res
						.status(422)
						.json({ success: false, message: "The users are not friends" });
				} else {
					ChatMessage.find({ _chatID: friendship._chatID })
						.sort({ createdAt: 1 })
						.then((chatMessages) => {
							res.status(200).json(chatMessages);
						})
						.catch((error) => {
							res.status(500).json(error);
						});
				}
			})
			.catch((error) => {
				res.status(500).json(error);
			});
	}
};

/**
 * Creates a new message
 */
const messagesNew = async (req, res) => {
	const params = messagePostParams.validate(req.body);
	const { value, error } = params,
		valid = error == null;

	if (!valid) {
		res.status(422).json({ success: false, message: error.details[0].message });
	} else {
		Friend.findOne({
			recipient: value.userID,
			requester: value.friendID,
			status: ACCEPTED,
		})
			.then((friendship) => {
				if (!friendship) {
					res
						.status(422)
						.json({ success: false, message: "The users are not friends" });
				} else {
					ChatMessage.create({
						_chatID: friendship._chatID,
						message: value.message,
						userID: value.userID,
						channel: value.channel,
					}).then(() => {
						ChatMessage.find({ _chatID: friendship._chatID })
							.sort({ createdAt: 1 })
							.then((chatMessages) => {
								/* eslint-disable require-unicode-regexp */
								const uuid = JSON.stringify(friendship._chatID).replace(/['"]+/g,
									"");
								res.io.emit(`chat-update:${uuid}`,
									chatMessages);
								res.status(200).json(chatMessages);
							})
							.catch((error) => {
								res.status(500).json(error);
							});
					})
						.catch((error) => {
							res.status(500).json(error);
						});
				}
			})
			.catch((error) => {
				res.status(500).json(error);
			});
	}
};

module.exports = {
	messages,
	messagesNew,
};
