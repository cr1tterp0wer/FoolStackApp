const Joi = require("@hapi/joi");
Joi.objectID = require("joi-objectid")(Joi);
const { ObjectId } = require("mongodb");
const User = require("../db/models/User");
const Friend = require("../db/models/Friend");
const ChatMessage = require("../db/models/ChatMessage");

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
const messages = async (req, res, next) => {
  const params = messageGetParams.validate(req.query);
  const { value, error } = params,
    valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error.details[0].message });
  } else {
    //check if they are friends. if not error;
    Friend.find({
      recipient: ObjectId(value.userID),
      requester: ObjectId(value.friendID),
      status: 3,
    })
      .then((friendship) => {
        if (!friendship.length) {
          res
            .status(422)
            .json({ success: false, message: "The users are not friends" });
        } else {
          // works, now get the messages with the userID
          //res.status(200).json(friendship);
          ChatMessage.find({ chatID: friendship.chatID })
            .sort({ createdAt: 1 })
            .then((chatMessages) => {
              console.log(chatMessages);
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
const messagesNew = async (req, res, next) => {
  const params = messagePostParams.validate(req.body);
  const { value, error } = params,
    valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error.details[0].message });
  } else {
    Friend.findOne({
      recipient: ObjectId(value.userID),
      requester: ObjectId(value.friendID),
      status: 3,
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
          }).then((chatMessage) => {
              ChatMessage.find({ _chatID: friendship._chatID })
                .sort({ createdAt: 1 })
                .then((chatMessages) => {
                  res.io.emit(`chat-update:${friendship._chatID}`, chatMessages);
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
              console.log(error);
        res.status(500).json(error);
      });
  }
};

module.exports = {
  messages,
  messagesNew,
};
