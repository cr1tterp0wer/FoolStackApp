const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectID = require("joi-objectid")(Joi);
const User = require("../db/models/User");
const Post = require("../db/models/Post");

// PostCreate Param validation schema
const postCreateParams = Joi.object({
	text: Joi.string()
		.trim()
		.required(),
	userID: Joi.objectID().required()
});

// PostCreate Param validation schema
const postEditParams = Joi.object({
	text: Joi.string()
		.trim()
		.required(),
	userID: Joi.objectID().required(),
	postID: Joi.objectID().required()
});

// PostDelete Param validation schema
const postDeleteParams = Joi.object({
	postID: Joi.objectID().required(),
	userID: Joi.objectID().required()
});

// PostAddPostComment Param validation schema
const postAddPostCommentParams = Joi.object({
	postID: Joi.objectID().required(),
	userID: Joi.objectID().required(),
	text: Joi.string()
		.trim()
		.required()
});

// PostEditPostComment Param validation schema
const postEditPostCommentParams = Joi.object({
	commentID: Joi.objectID().required(),
	text: Joi.string()
		.trim()
		.required(),
	userID: Joi.string()
		.trim()
		.required()
});

// PostLike Param validation schema
const postLikeParams = Joi.object({
	postID: Joi.objectID().required(),
	userID: Joi.objectID().required()
});

const commentLikeParams = Joi.object({
	postID: Joi.objectID().required(),
	userID: Joi.objectID().required(),
	commentID: Joi.objectID().required()
});
/**
 * Fetches all posts from the db using Post model
 * @return {Array} - a list of post objects
 */
const getPosts = async (req, res) => {
	Post.find({})
		.sort({ createdAt: -1 })
		.then((posts) => {
			res.status(200).json(posts);
		})
		.catch((error) => {
			res.status(500).json(error);
		});
};

/**
 * Creates a post in the DB
 * @return {Object} - the new post object
 */
const createPost = async (req, res) => {
	const params = postCreateParams.validate(req.body);
	const { value, error } = params,
		valid = error == null;

	if (!valid) {
		res.status(422).json({ success: false, message: error.details[0].message });
	} else {
		User.findOne({ _id: value.userID }).then((user) => {
			const newPost = new Post({
				author: user.username,
				userID: user.id,
				text: value.text,
				user: user,
				createdAt: new Date(),
				comments: []
			});

			newPost
				.save()
				.then((postData) => {
					res.status(200).json(postData);
				})
				.catch((error) => {
					res.status(500).json(error);
				});
		});
	}
};

/**
 * Edit a post in the DB
 * @return {Object} - the new post object
 */
const editPost = (req, res) => {
	const params = postEditParams.validate(req.body);
	const { value, error } = params,
		valid = error == null;

	if (!valid) {
		res.status(422).json({ success: false, message: error.details[0].message });
	} else {
		Post.findOneAndUpdate(
			{ _id: value.postID, userID: value.userID },
			{ text: value.text, updatedAt: new Date() },
			{
				new: true,
				fields: { updatedAt: 1, text: 1 },
			}
		)
			.then((success) => {
				res.json(success);
			})
			.catch((err) => {
				res.json(err);
			});
	}
};

/**
 * Deletes a specific post in the DB with given id
 * @param postID {Integer} - the post id of the target
 * @return {Object} - the Mongoose response
 */
const deletePost = async (req, res) => {
	const params = postDeleteParams.validate(req.body);
	const { value, error } = params,
		valid = error == null;

	if (!valid) {
		res.status(422).json({ success: false, message: error.details[0].message });
	} else {
		Post.deleteOne({ _id: value.postID, userID: value.userID })
			.then(() => {
				res.status(200).json({ postID: value.postID });
			})
			.catch((error) => {
				res.status(422).json({ success: false, message: error });
			});
	}
};

/**
 * Create a new comment to a specific Post
 * @param postID {Integer} - the post id of the target
 * @param comment {Object} - the comment data
 * @return {Object} - the Mongoose response
 */
const addPostComment = (req, res) => {
	const params = postAddPostCommentParams.validate(req.body);
	const { value, error } = params,
		valid = error == null;

	if (!valid) {
		res.status(422).json({ success: false, message: error.details[0].message });
	} else {
		User.findOne({ _id: value.userID })
			.then((user) => {
				const createdAt = new Date();
				const newComment = {
					userID: value.userID,
					text: value.text,
					author: user.username,
					createdAt: createdAt,
					updatedAt: createdAt,
				};
				Post.findOneAndUpdate(
					{ _id: value.postID },
					{ $push: { comments: newComment } },
					{ new: true }
				)
					.select({
						comments: { $elemMatch: { userID: value.userID, createdAt } },
					})
					.then((comment) => {
						res.status(200).json(comment);
					})
					.catch((error) => {
						res.status(422).json({ success: false, message: error });
					});
			})
			.catch((error) => {
				res.status(422).json(error);
			});
	}
};

/**
 * Create a new comment to a specific Post
 * @param postID {Integer} - the post id of the target
 * @param comment {Object} - the comment data
 * @return {Object} - the Mongoose response
 */
const editPostComment = (req, res) => {
	const params = postEditPostCommentParams.validate(req.body);
	const { value, error } = params,
		valid = error == null;
	if (!valid) {
		res.status(422).json({ success: false, message: error.details[0].message });
	} else {
		Post.findOneAndUpdate(
			{ "comments._id": value.commentID, "comments.userID": value.userID },
			{
				$set: {
					"comments.$.text": value.text,
					"comments.$.updatedAt": new Date(),
				},
			},
			{ new: true }
		)
			.select({ comments: { $elemMatch: { userID: value.userID } } })
			.then((comment) => {
				res.status(200).json(comment);
			})
			.catch((err) => {
				res.json(err);
			});
	}
};

/**
 * Delete a comment
 * @param postID {String} - the post id of the target
 * @param userID {String} - the comment data
 * @param commentID {String} - the comment data
 * @resolve {Object} - the Mongoose response
 * @reject {Object} - mongoose response error
 */
const deletePostComment = (req, res) => {
	const params = commentLikeParams.validate(req.body);
	const { value, error } = params,
		valid = error == null;

	if (!valid) {
		res.status(422).json({ success: false, message: error.details[0].message });
	} else {
		Post.updateOne(
			{ _id: value.postID },
			{ $pull: { comments: { _id: value.commentID, userID: value.userID } } }
		)
			.then((success) => {
				res.json({ success });
			})
			.catch((error) => {
				res.json({ error });
			});
	}
};

/**
 * Create a new like to a specific Post
 * @param postID {String} - the post id of the target
 * @param userID {String} - the comment data
 * @resolve {Object} - the Mongoose response
 * @reject {Object} - mongoose response error
 */
const addPostLike = (req, res) => {
	const params = postLikeParams.validate(req.body);
	const { value, error } = params,
		valid = error == null;

	if (!valid) {
		res.status(422).json({ success: false, message: error.details[0].message });
	} else {
		const likeObj = { userID: value.userID, createdAt: new Date() };
		Post.findOneAndUpdate(
			{ _id: mongoose.Types.ObjectId(value.postID) },
			{ $push: { likes: likeObj } },
			{ new: true }
		)
			.select({ likes: { $elemMatch: { userID: value.userID } } })
			.then((newLike) => {
				res.json(newLike);
			})
			.catch((error) => {
				res.json(error);
			});
	}
};

/**
 *Remove a like to a specific Post
 * @param postID {String} - the post id of the target
 * @param userID {String} - the comment data
 * @resolve {Object} - the Mongoose response
 * @reject {Object} - mongoose response error
 *
 */
const removePostLike = (req, res) => {
	const params = postLikeParams.validate(req.body);
	const { value, error } = params,
		valid = error == null;

	if (!valid) {
		res.status(422).json({ success: false, message: error.details[0].message });
	} else {
		Post.updateOne(
			{ _id: mongoose.Types.ObjectId(value.postID) },
			{ $pull: { likes: { userID: value.userID } } }
		)
			.then((success) => {
				res.json(success);
			})
			.catch((error) => {
				res.json(error);
			});
	}
};

/**
 *Add like to a comment
 * @param postID {String} - the post id of the target
 * @param userID {String} - the comment data
 * @resolve {Object} - the Mongoose response
 * @reject {Object} - mongoose response error
 *
 */
const addCommentLike = (req, res) => {
	const params = commentLikeParams.validate(req.body);
	const { value, error } = params,
		valid = error == null;

	if (!valid) {
		res.status(422).json({ success: false, message: error.details[0].message });
	} else {
		const likeObj = { userID: value.userID, createdAt: new Date() };
		Post.findOneAndUpdate(
			{ _id: value.postID },
			{
				$push: { "comments.$[commentMatch].likes": likeObj },
			},
			{
				new: true,
				fields: { comments: 1 },
				arrayFilters: [{ "commentMatch._id": value.commentID }],
			}
		)
			.select({ comments: { $elemMatch: { _id: value.commentID } } })
			.then((success) => {
				let like = success.comments[0].likes.find(
					(element) => element.userID == value.userID
				);
				res.json({ like });
			})
			.catch((error) => {
				res.json(error);
			});
	}
};

/**
 * Remove like from a comment
 * @param postID {String} - the post id of the target
 * @param userID {String} - the comment data
 * @param commentID {String} - the comment ID
 * @resolve {Object} - the Mongoose response
 * @reject {Object} - mongoose response error
 *
 */
const removeCommentLike = (req, res) => {
	const params = commentLikeParams.validate(req.body);
	const { value, error } = params,
		valid = error == null;

	if (!valid) {
		res.status(422).json({ success: false, message: error.details[0].message });
	} else {
		Post.updateOne(
			{ _id: value.postID },
			{
				$pull: { "comments.$[commentMatch].likes": { userID: value.userID } },
			},
			{
				arrayFilters: [{ "commentMatch._id": value.commentID }],
			}
		)
			.then((success) => {
				res.json({ success });
			})
			.catch((error) => {
				res.json(error);
			});
	}
};

/**
 * Destroys all posts within the database
 * @return {Object} - the Mongoose response
 */
const deleteAllPosts = (req, res) => {
	Post.deleteMany({})
		.then(() => {
			res.status(200).json({ success: true, message: "All posts deleted!" });
		})
		.catch((error) => {
			res.status(422).json(error);
		});
};

module.exports = {
	getPosts,
	createPost,
	editPost,
	deletePost,
	addPostComment,
	deleteAllPosts,
	addPostLike,
	removePostLike,
	editPostComment,
	deletePostComment,
	addCommentLike,
	removeCommentLike,
};
