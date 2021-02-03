<template>
  <div class="mb-4">
    <b-card :title="post.author">
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
        :key="comment._id" :Comment="comment" :postID='post._id' :userID="userID"/>
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
    userID: String,
  },
  data() {
    return {
      author: '',
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
      const data = {
        userID: this.userID,
        postID: this.post._id,
        text: this.newCommentText,
      };
      const config = {
        headers: {
          Authorization: this.$session.get('nu_social_t'),
        },
      };
      // post to DB here with axios
      axios.patch('/api/addPostComment', data, config).then((comment) => {
        this.post.comments.push(comment.data);
      }).catch((error) => {
        throw (error);
      });
      this.newCommentText = '';
    },
    LikePost() {
      const data = {
        userID: this.userID,
        postID: this.post._id,
      };
      const config = {
        headers: {
          Authorization: this.$session.get('nu_social_t'),
        },
      };
      axios.patch('/api/addPostLike', data, config).then((post) => {
        this.post.likes = post.data.likes;
      }).catch((error) => {
        console.log(error);
      });
    },
  },
};
</script>

<style scoped>
</style>
