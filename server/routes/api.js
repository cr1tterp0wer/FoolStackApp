const express = require('express');
const MUUID = require('uuid-mongodb');
MUUID.mode('relaxed');

const APIRouter = express.Router();
const PostController = require('../controllers/PostController');
const UserController = require('../controllers/UserController');
const SessionController = require('../controllers/SessionController');
const Session = require('../db/models/Session');

const authValidation = (req, res, next) => {
  const token = req.headers["authorization"];  

  if (!token) {
    res.status(403).json({ success: false, message: 'PROTECTED' });
  }

  const session = new Session();
  session.validateUserBySession(token).then((session) => {
    if (session) next();
    else res.status(403).json({ success: false, message: 'PROTECTED' });
  }).catch((error) => {
    res.status(403).json({ success: false, message: 'PROTECTED' });
  });
};

APIRouter.post('/auth/new', SessionController.sessionsNew);
APIRouter.delete('/auth/delete', SessionController.sessionsDestroy);

APIRouter.get('/users/register', UserController.usersRegister);
APIRouter.post('/users/new', UserController.usersNew);
APIRouter.post('/users/revalidate', UserController.usersRevalidate);
APIRouter.delete('/users/deleteAll', UserController.deleteAllUsers);

APIRouter.get('/getAllPosts', authValidation, PostController.getAllPosts);
APIRouter.post('/createPost', authValidation, PostController.createPost);
APIRouter.delete('/deleteAllPosts', authValidation, PostController.deleteAllPosts);
APIRouter.delete('/removePost', authValidation, PostController.deleteAllPosts);
APIRouter.patch('/addPostComment', authValidation, PostController.addPostComment);
APIRouter.patch('/editPostComment', authValidation, PostController.editPostComment);
APIRouter.patch('/addPostLike', authValidation, PostController.addPostLike);
APIRouter.patch('/removePostLike', authValidation, PostController.removePostLike);

APIRouter.patch('/addCommentLike', authValidation, PostController.addCommentLike);


module.exports = APIRouter;
