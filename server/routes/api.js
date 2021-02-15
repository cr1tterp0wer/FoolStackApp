require('dotenv');
const express = require('express');
const APIRouter = express.Router();
const PostController = require('../controllers/PostController');
const UserController = require('../controllers/UserController');
const SessionController = require('../controllers/SessionController');
const Session = require('../db/models/Session');
const PROTECTED = 'PROTECTED';

/**
 * Route guard, validates a given token corresponds
 * to a valid {session|user}
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {Function} next - Express middleware callback
 */
const authValidation = (req, res, next) => {
  const token = req.headers["authorization"];  

  if (!token) {
    res.status(403).json({ success: false, message: PROTECTED });
  }

  Session.validateToken(token).then((data) => {
    if (data) {
      next();
    } else {
      res.status(403).json({ success: false, message: PROTECTED });
    }
  });
};

// Sessions routes
APIRouter.post('/sessions', SessionController.sessionsNew);
APIRouter.delete('/sessions', authValidation, SessionController.sessionsDestroy);

// Users routes
APIRouter.post('/users', UserController.usersNew);
APIRouter.patch('/users', authValidation, UserController.usersUpdate);
APIRouter.delete('/users', authValidation, UserController.usersDelete);

// Posts routes
APIRouter.get('/posts', authValidation, PostController.getPosts);
APIRouter.post('/posts', authValidation, PostController.createPost);
APIRouter.patch('/posts', authValidation, PostController.editPost);
APIRouter.delete('/posts', authValidation, PostController.deletePost);

// Comments routes
APIRouter.post('/posts/comments', authValidation, PostController.addPostComment);
APIRouter.patch('/posts/comments', authValidation, PostController.editPostComment);
APIRouter.delete('/posts/comments', authValidation, PostController.deletePostComment);
APIRouter.post('/posts/comments/likes', authValidation, PostController.addCommentLike);
APIRouter.delete('/posts/comments/likes', authValidation, PostController.removeCommentLike);

// Likes routes
APIRouter.post('/posts/likes', authValidation, PostController.addPostLike);
APIRouter.delete('/posts/likes', authValidation, PostController.removePostLike);

// Custom Actions routes
APIRouter.get('/', UserController.usersRegister);
APIRouter.post('/revalidate', UserController.usersRevalidate);
APIRouter.get('/register', UserController.usersRegister);
APIRouter.delete('/drop-posts', authValidation, PostController.deleteAllPosts);
APIRouter.post('/reset-password', UserController.resetPassword);
APIRouter.get('/validate-password', UserController.validatePassword);

module.exports = APIRouter;
