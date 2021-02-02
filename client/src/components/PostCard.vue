<template>
  <div class="mb-4">
    <b-card :title="post.createdBy">
      <b-card-text>
        {{ common.stringToLocaleDate(post.createdAt) }}
      </b-card-text>
      <b-card-text>
        {{ post.text }}
      </b-card-text>
      <a href="#" class="card-link" @click="LikePost()"
        >Like ({{ post.likes.length }})
      </a>
      <b-link @click="showComments = !showComments" class="card-link"
        >Comments ({{ post.comments.length }})</b-link
      >
      <div v-if="showComments">
       <Comment  v-for="comment in post.comments"
        :key="comment._id" :Comment="comment" :postId='post._id' :userId="userId"/>
      </div>
      <b-form-textarea
        size="sm"
        placeholder="What's on your mind?"
        v-model="newCommentText"
      ></b-form-textarea>
      <b-button variant="outline-primary" @click="createNewComment()">Comment</b-button>
    </b-card>
  </div>
</template>

<script>
import axios from 'axios';
import Comment from './Comment.vue';
import common from '../helpers/common';

export default {
  name: 'PostCard',
  components: {
    Comment,
  },
  props: {
    postObj: Object,
    userId: String,
  },
  data() {
    return {
      post: this.postObj,
      newPostText: '',
      newCommentText: '',
      newEditText: {},
      showComments: false,
      common,
    };
  },
  methods: {
    createNewComment() {
      // post to DB here with axios
      axios.patch('/api/addPostComment', {
        userId: this.userId,
        postId: this.post._id,
        text: this.newCommentText,
        createdBy: 'Elliot',
      }).then((commenter) => {
        window.console.log(commenter.data);
        this.post.comments.push(commenter.data.comments[0]);
      }).catch((error) => {
        throw (error);
      });
      this.newCommentText = '';
    },
    LikePost() {
      axios.patch('/api/addPostLike', {
        userId: this.userId,
        postId: this.post._id,
      }).then((like) => {
        window.console.log(like);
        this.post.likes.push(like.data.msg.likes[0]);
      }).catch((error) => {
        window.console.log(error);
      });
    },
  },
};
</script>

<style scoped>
</style>
