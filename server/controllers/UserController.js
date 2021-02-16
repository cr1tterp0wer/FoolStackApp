require("dotenv");
const Joi = require("@hapi/joi");
Joi.objectID = require("joi-objectid")(Joi);
const nodemailer = require("nodemailer");
const mongooseErrorHandler = require("mongoose-error-handler");
const { ObjectId } = require("mongodb");
const HashValidation = require("../db/models/HashValidation");
const Session = require("../db/models/Session");
const User = require("../db/models/User");
const PORT = process.env.VUE_PORT || "8080";
const HOST = process.env.HOST || "localhost";
const ENVIRONMENT = process.env.ENVIRONMENT || "DEV";
const BASE_URL = ENVIRONMENT == "DEV" ? `${HOST}:${PORT}` : HOST;

// UserCreate Param validation schema
const userCreateParams = Joi.object({
  email: Joi.string()
    .trim()
    .regex(/^([a-zA-Z0-9]|-|.|_|)*@([a-zA-Z0-9])*.nu.edu/)
    .required(),
  firstname: Joi.string()
    .trim()
    .required(),
  lastname: Joi.string()
    .trim()
    .required(),
  password: Joi.string()
    .trim()
    .required()
    .min(6)
    .max(50),
  username: Joi.string()
    .trim()
    .required()
    .min(6)
    .max(50),
});

// UserUpdate Param validation schema
const userUpdateParams = Joi.object({
  userID: Joi.objectID().required(),
  firstname: Joi.string()
    .trim()
    .optional(),
  lastname: Joi.string()
    .trim()
    .optional(),
  password: Joi.string()
    .trim()
    .min(6)
    .max(50)
    .optional(),
  passwordVerify: Joi.string()
    .trim()
    .min(6)
    .max(50)
    .optional(),
  vhs: Joi.string()
    .guid()
    .optional(),
  updatedAt: Joi.date().optional(),
});

// UserRegister Param validation schema
const userRegisterParams = Joi.object({
  userID: Joi.string()
    .trim()
    .required(),
  vhs: Joi.string().guid(),
});

// UserDelete Param validation schema
const userDeleteParams = Joi.object({
  userID: Joi.string()
    .trim()
    .required(),
});

// UserRevaliate Param validation schema
const userRevalidateParams = Joi.object({
  email: Joi.string()
    .trim()
    .regex(/^([a-zA-Z0-9]|-|.|_|)*@([a-zA-Z0-9])*.nu.edu/)
    .required(),
});

/**
 * POST: /users/new
 * Creates a user in the DB
 * @param {Object} - user data obj
 * @return {Object} - the new user object
 */
const usersNew = async (req, res, next) => {
  const params = userCreateParams.validate(req.body);
  const { value, error } = params,
    valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error.details[0].message });
  } else {
    const user = new User({
      createdAt: new Date(),
      email: value.email,
      firstname: value.firstname,
      lastname: value.lastname,
      username: value.username,
    });

    user.password_digest = user.digestPassword(value.password);

    user
      .save()
      .then((userStatus) => {
        HashValidation.createHashValidation(userStatus._id)
          .then((hashStatus) => {
            const title = "Register NU Social Account";
            const body =
              "Click the link to complete your NU Social Account validation";

            sendMailValidation(
              value.email,
              "validate-user",
              hashStatus._id,
              hashStatus.userID,
              title,
              body
            );
            res.status(200).json({ success: true, message: "Email sent" });
          })
          .catch((error) => {
            res.status(400).json({ success: false, message: error });
          });
      })
      .catch((error) => {
        if (error.code == 11000) {
          res.status(400).json({
            success: false,
            message: "User exists! Check your email for validation!",
          });
        } else {
          res.status(400).json({
            success: false,
            message: mongooseErrorHandler.set(error, req.t),
          });
        }
      });
  }
};

/**
 * DEPRECATED
 * Destroys all users within the database
 * @return {Object} - the Mongoose response
 */
async function deleteAllUsers() {
  const retval = await User.deleteMany({});
  return retval;
}

/**
 * DELETE: /users
 * Removes a user from the database given a valid id
 * @param {Mongo.ID} userID - the user id
 * @return {Object} response
 */
const usersDelete = async (req, res, next) => {
  const params = userDeleteParams.validate(req.body);
  const { value, error } = params,
    valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error.details[0].message });
  } else {
    HashValidation.deleteAllUserHashes(value.userID);
    Session.deleteAllUserSessions(value.userID);
    User.deleteOne({ _id: ObjectId(value.userID) })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(400).json({
          success: false,
          message: mongooseErrorHandler.set(error, req.t),
        });
      });
  }
};

/**
 * PATCH: /users
 * Updates a user from the database given a valid id
 * @param {Mongo.ID} userID - the user id
 * @param {String} - firstname
 * @param {String} - lastname
 * @param {String} - password
 * @param {String} - passwordVerification
 * @param {UUID} vhs - the hash validation
 * @return {Object} response
 */
const usersUpdate = async (req, res, next) => {
  const params = userUpdateParams.validate(req.body);
  const { value, error } = params,
    valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error.details[0].message });
  } else {
    const passwordsPresent = value.password && value.passwordVerify;
    const passwordsMatch = value.password === value.passwordVerify;
    let updateParams = {};

    if (value.firstname) {
      updateParams.firstname = value.firstname;
    }
    if (value.lastname) {
      updateParams.lastname = value.lastname;
    }

    if (value.updatedAt) {
      updateParams.updatedAt = value.updatedAt;
    }

    // If the req was a result of a password-reset validation email
    if (value.vhs) {
      userParams = {};
      await HashValidation.deleteHashValidation(value.userID, value.vhs);
    }
    if (passwordsPresent) {
      if (passwordsMatch)
        updateParams.password_digest = User.digestPassword(value.password);
      else
        res
          .status(400)
          .json({ success: false, message: "Password fields do not match!" });
    }
    if (Object.keys(updateParams).length) {
      updateParams.updatedAt = new Date();

      User.findOneAndUpdate({ _id: ObjectId(value.userID) }, updateParams, {
        new: true,
      })
        .then((success) => {
          res.json(success);
        })
        .catch((error) => {
          res.json(error);
        });
    }
  }
};

/**
 * POST:/users/validate
 * Resends the new user an email validation link
 * @param {Object} - the validation data
 * @return {*}
 */
const usersValidate = async (req, res) => {
  // Register params
  const params = userRevalidateParams.validate(req.body);
  const { value, error } = params,
    valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error.details[0].message });
  } else {
    User.findOne({ email: value.email }).then((userStatus) => {
      if (!userStatus) {
        res.status(422).json({ success: false, message: "Email not found" });
      } else if (userStatus.updatedAt) {
        HashValidation.deleteAllUserHashes(ObjectId(userStatus._id))
          .then((deleted) => {
            res.status(422).json({
              success: false,
              message: "User already registered.",
            });
          })
          .catch((error) => {
            res.status(422).json({
              success: false,
              message: "User already registered.",
            });
          });
      } else {
        HashValidation.deleteAllUserHashes(ObjectId(userStatus._id))
          .then((deleted) => {
            HashValidation.createHashValidation(userStatus._id)
              .then((hashStatus) => {
                const title = "Register NU Social Account";
                const body =
                  "Click the link to complete your NU Social Account validation";

                sendMailValidation(
                  value.email,
                  "validate-user",
                  hashStatus._id,
                  hashStatus.userID,
                  title,
                  body
                );
                res.status(200).json({ success: true, message: "Email sent" });
              })
              .catch((error) => {
                res.status(400).json({ success: false, message: error });
              });
          })
          .catch((error) => {
            res.status(400).json({ success: false, message: error });
          });
      }
    });
  }
};

/**
 * POST: /reset-password
 * Begins the password reset process by
 * adding a password reset hash in the User Model
 * and sending an email validation
 * @param {Object} - the validation data
 * @return {*}
 */
const resetPassword = (req, res) => {
  // Register params
  const params = userRevalidateParams.validate(req.body);
  const { value, error } = params,
    valid = error == null;

  if (!valid) {
    res.status(422).json({ success: false, message: error });
  } else {
    User.findOne({ email: value.email }).then((userStatus) => {
      if (!userStatus) {
        res.status(422).json({ success: false, message: "Email not found" });
      } else if (!userStatus.updatedAt) {
        res.status(403).json({
          success: false,
          message: "User not registered, please register your account.",
        });
      } else {
        HashValidation.deleteAllUserHashes(ObjectId(userStatus._id))
          .then((deleted) => {
            HashValidation.createHashValidation(userStatus._id)
              .then((hashStatus) => {
                const title = "NU Social Account Password Reset Request";
                const body =
                  "Click the link to temporarily reset your password to: " +
                  hashStatus._id;

                sendMailValidation(
                  value.email,
                  "reset-password",
                  hashStatus._id,
                  hashStatus.userID,
                  title,
                  body
                );
                res.status(200).json({ success: true, message: "Email sent" });
              })
              .catch((error) => {
                res.status(400).json({ success: false, message: error });
              });
          })
          .catch((error) => {
            res.status(400).json({ success: false, message: error });
          });
      }
    });
  }
};

/* PRIVATE */

/**
 * Send Mail verification from NU social gmail accnt
 * @param {String} email - to email
 * @param {String} hash - validation hash
 * @param {String} userID - the new users ID
 * @return {*}
 */
const sendMailValidation = (email, stub, hash, userID, title, body) => {
  const URL = `${BASE_URL}/${stub}?userID=${userID}&vhs=${hash}`;

  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: "nusocial.contact@gmail.com",
    to: email,
    subject: title,
    html:
      `${"<html><body>" +
        "<h3>" +
        body +
        "</h3>" +
        '<a href="'}${URL}">${URL}</a>` + "</body></html>",
  };

  transport.sendMail(message, (err /* , info */) => {
    if (err) {
      /* eslint-disable no-console */
      console.log("this is the spot", err);
    }
  });
};

module.exports = {
  resetPassword,
  usersNew,
  usersUpdate,
  usersDelete,
  usersValidate,
  userUpdateParams,
};
