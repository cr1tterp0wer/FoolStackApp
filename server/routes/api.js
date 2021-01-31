const express = require('express');

const APIRouter = express.Router();
const PostController = require('../controllers/PostController');
const UserController = require('../controllers/UserController');
const SessionController = require('../controllers/SessionController');

APIRouter.post('/auth/new', SessionController.sessionsNew);
APIRouter.delete('/auth/delete', SessionController.sessionsDestroy);
APIRouter.get('/users/register', UserController.usersRegister);
APIRouter.post('/users/new', UserController.usersNew);

APIRouter.delete('/users/deleteAll', (req, res) => {
  UserController.deleteAllUsers()
    .then((data) => {
      res.json(data);
    }).catch((err) => res.json(err));
});

APIRouter.get('/getAllPosts', (req, res) => {
  PostController.getAllPosts()
    .then((posts) => {
      res.json(posts);
    }).catch((err) => res.json(err));
});

APIRouter.post('/createPost', (req, res) => {
  PostController.createPost(req.body)
    .then((createdPost) => {
      res.json(createdPost);
    }).catch((err) => res.json(err));
});

APIRouter.delete('/removePost', (req, res) => {
  PostController.deleteAllPosts(req.body.postId)
    .then((success) => {
      res.json(success);
    }).catch((err) => res.json(err));
});

APIRouter.patch('/addPostComment', (req, res) => {
  PostController.addPostComment(req.body.userId, req.body.postId, req.body.text, req.body.createdBy)
    .then((success) => {
      res.json(success);
    }).catch((err) => res.json(err));
});

APIRouter.patch('/editPostComment', (req, res) => {
  PostController.editPostComment(req.body.commentId,
    req.body.userId, req.body.postId, req.body.text)
    .then((success) => {
      res.json(success);
    }).catch((err) => res.json(err));
});

APIRouter.patch('/addPostLike', (req, res) => {
  PostController.addPostLike(req.body.postId, req.body.userId).then((likeSuccess) => {
    res.status(200).json({ success: true, msg: likeSuccess });
  }).catch((error) => {
    res.status(400).json({ success: false, msg: error });
  });
}); // TODO verify token

APIRouter.post('/deleteAllPosts', (req, res) => {
  PostController.deleteAllPosts()
    .then((deletedVerification) => {
      res.json(deletedVerification);
    }).catch((err) => res.json(err));
});

module.exports = APIRouter;
