require("dotenv");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const Friend = require("./Friend");

const UserSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	firstname: { type: String, required: true },
	lastname: { type: String, required: true },
	password_digest: { type: String, required: true },
	createdAt: { type: Date, required: true },
	updatedAt: { type: Date }, // Use this as the boolean for whether or not they validated email
	username: { type: String, required: true, unique: true },
	friends: [{ type: ObjectId, ref: "Friend" }],
});

/**
 * White list certain values so we don't expose
 * sensitive data to front-end
 */
UserSchema.set("toJSON",
	{
		transform: function (doc, ret, options) {
			let retJson = {
				id: ret._id,
				email: ret.email,
				firstname: ret.firstname,
				lastname: ret.lastname,
				username: ret.username,
				friends: ret.friends,
			};

			return retJson;
		},
	});

/**
 * Generates a password digest with bcrypt
 * @param {String} password - Users plaintext password
 * @return {String} hashed password
 */
UserSchema.methods.digestPassword = (password) => {
	const salt = bcrypt.genSaltSync(SALT_ROUNDS);

	return bcrypt.hashSync(password,
		salt);
};

/**
 * Generates a password digest with bcrypt
 * @param {String} password - Users plaintext password
 * @return {String} hashed password
 */
UserSchema.statics.digestPassword = (password) => {
	const salt = bcrypt.genSaltSync(SALT_ROUNDS);

	return bcrypt.hashSync(password,
		salt);
};

/**
 * Generates a password digest with bcrypt
 * @param {String} password - Users plaintext password
 * @return {String} hashed password
 */
UserSchema.methods.validatePassword = (password, passwordDigest) => bcrypt.compareSync(password,
	passwordDigest);

/**
 * Generates a list of all users with their current friend status
 * given a userID
 * @param {String} userID - userID
 * @return {Array} users + respective_friendStatus
 */
UserSchema.statics.getUserFriendsList = (userID) => User.aggregate([
	{
		$match: {
			$and: [
				{ updatedAt: { $exists: true } },
				{ _id: { $ne: ObjectId(userID) } },
			],
		},
	},
	{
		$lookup: {
			from: Friend.collection.name,
			let: { friends: "$friends" },
			as: "friends",
			pipeline: [
				{
					$match: {
						recipient: ObjectId(userID),
						$expr: { $in: [
							"$_id",
							"$$friends"
						] },
					},
				},
				{
					$project: {
						status: 1,
						_chatID: 1,
					},
				},
			],
		},
	},
	{
		$addFields: {
			chatID: "$friends._chatID",
			friendsStatus: {
				$ifNull: [
					{ $min: "$friends.status" },
					0
				],
			},
		},
	},
	{
		$project: {
			createdAt: 0,
			updatedAt: 0,
			friends: 0,
			password_digest: 0,
		},
	},
]).sort({ friendsStatus: -1 });

const User = mongoose.model("User",
	UserSchema);

module.exports = User;
