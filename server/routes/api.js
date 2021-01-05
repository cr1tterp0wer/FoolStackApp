const express = require('express');

const APIRouter = express.Router();

const Posts = require('../db/collections/Posts');

APIRouter.get('/getAllPosts', (req, res) => {
  Posts.getAllPosts()
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => err);
});

// req.body: { post schema }
APIRouter.post('/createPost', (req, res) => {
  Posts.createPost(req.body)
    .then((createdPost) => {
      res.json(createdPost);
    })
    .catch(() => {
      // some error handling here..
    });
});

APIRouter.delete('/removePost', (req, res) => {
  Posts.deleteAllPosts(req.body.postId)
    .then((success) => {
      res.json(success);
    })
    .catch((error) => {
      res.json(error);
    });
});

// body {postId: "fjdkfjksdjfk", comment:{}}
APIRouter.post('/addPostComment', (req, res) => {
  Posts.addPostComment(req.body.postId, req.body.comment)
    .then((success) => {
      res.json(success);
    })
    .catch((err) => {
      res.json(err);
      // some error handling here..
    });
});

APIRouter.post('/deleteAllPosts', (req, res) => {
  Posts.deleteAllPosts()
    .then((deletedVerification) => {
      res.json(deletedVerification);
    })
    .catch(() => {
      // some error handling here..
    });
});

module.exports = APIRouter;
