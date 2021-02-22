const Joi = require("@hapi/joi");
Joi.objectID = require("joi-objectid")(Joi);
const { ObjectId } = require("mongodb");
const User = require("../db/models/User");
const Friend = require("../db/models/Friend");

const friendGetParams = Joi.object({
  userID: Joi.objectID().required(),
});

const friendCreateParams = Joi.object({
  userID: Joi.objectID().required(),
  friendID: Joi.objectID().required(),
});

const friendUpdateParams = Joi.object({
  userID: Joi.objectID().required(),
  friendID: Joi.objectID().required(),
  accepted: Joi.boolean().required(),
});

/**
 * Gets all users with friend status
 */
const friends = async (req, res, next) => {
  const params = friendGetParams.validate(req.query);
  const { value, error } = params,
    valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error.details[0].message });
  } else {
    User.getUserFriendsList(value.userID)
      .then((friends) => {
        res.status(200).json(friends);
      })
      .catch((error) => {
        res.status(422).json(error);
      });
  }
};

/**
 * POST: /api/friends
 * Creates a friend request
 */
const friendsNew = async (req, res, next) => {
  const params = friendCreateParams.validate(req.body);
  const { value, error } = params,
    valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error.details[0].message });
  } else {
    try {
      const friendOne = await Friend.findOneAndUpdate(
        { requester: value.userID, recipient: value.friendID },
        { $set: { status: 2 } },
        { upsert: true, setDefaultsOnInsert: true, new: true }
      );

      const friendTwo = await Friend.findOneAndUpdate(
        { requester: value.friendID, recipient: value.userID },
        { $set: { status: 1, _chatID: friendOne._chatID } },
        { upsert: true, setDefaultsOnInsert: true, new: true }
      );

      const updateFriendOne = await User.findOneAndUpdate(
        { _id: value.userID },
        { $push: { friends: friendOne._id } }
      );

      const updateFriendTwo = await User.findOneAndUpdate(
        { _id: value.friendID },
        { $push: { friends: friendTwo._id } }
      );
    } catch (error) {
      res.status(500).json(error);
      return;
    }

    User.getUserFriendsList(value.userID)
      .then((friends) => {
        res.status(200).json(friends);
      })
      .catch((error) => {
        res.status(422).json(error);
      });
  }
};

/**
 * Resolves a friend request OR removes a friend
 */
const friendsUpdate = async (req, res, next) => {
  const params = friendUpdateParams.validate(req.body);
  const { value, error } = params,
    valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error.details[0].message });
  } else {

    if (value.accepted) {
      try {
        await Friend.findOneAndUpdate(
          { requester: value.userID, recipient: value.friendID },
          { $set: { status: 3 } }
        );
        await Friend.findOneAndUpdate(
          { requester: value.friendID, recipient: value.userID },
          { $set: { status: 3 } }
        );
      } catch(error) {
        res.status(500).json(error);
        return;
      }
    } else {
      try {
        const friendOne = await Friend.findOneAndRemove({
          requester: value.userID,
          recipient: value.friendID,
        });
        const friendTwo = await Friend.findOneAndRemove({
          requester: value.friendID,
          recipient: value.userID,
        });

        const updateFriendOne = await User.findOneAndUpdate(
          { _id: value.userID },
          { $pull: { friends: friendOne._id } }
        );
        const updateFriendTwo = await User.findOneAndUpdate(
          { _id: value.friendID },
          { $pull: { friends: friendTwo._id } }
        );
      } catch(error) {
        res.status(500).json(error);
        return;
      }
    }

    User.getUserFriendsList(value.userID)
      .then((friends) => {
        res.status(200).json(friends);
      })
      .catch((error) => {
        res.status(422).json(error);
      });
  }
};

module.exports = {
  friends,
  friendsNew,
  friendsUpdate,
};
