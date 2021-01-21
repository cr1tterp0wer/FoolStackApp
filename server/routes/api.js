const express = require('express');

const APIRouter = express.Router();
const PostController = require('../controllers/PostController');
const UserController = require('../controllers/UserController');

APIRouter.post('/users/new', UserController.createUser);

APIRouter.post('/users/deleteAll', (req, res) => {
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

APIRouter.post('/addPostComment', (req, res) => {
  PostController.addPostComment(req.body.postId, req.body.comment)
    .then((success) => {
      res.json(success);
    }).catch((err) => res.json(err));
});

APIRouter.patch('/addPostLike', (req, res) => {
  // TODO: add token verification .then(addPostLike)
  PostController.addPostLike(req.body.postId, req.body.userId)
    .then((likeVerification) => {
      res.status(200).json({ success: true, msg: likeVerification });
    }).catch((err) => {
      res.status(400).json({ success: false, msg: err });
    });
});

APIRouter.post('/deleteAllPosts', (req, res) => {
  PostController.deleteAllPosts()
    .then((deletedVerification) => {
      res.json(deletedVerification);
    }).catch((err) => res.json(err));
});

module.exports = APIRouter;
