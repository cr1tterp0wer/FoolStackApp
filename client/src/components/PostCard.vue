<template>
  <div class="mb-4">
    <b-card :title="post.author">
      <b-card-text>
        {{ common.stringToLocaleDate(post.createdAt) }}
      </b-card-text>
      <b-card-text>
        {{ post.text }}
      </b-card-text>
      <p :class="{ liked: userLiked }" @click="TogglePostLike()"
        >Like ({{ post.likes.length }})
      </p>
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
    TogglePostLike() {
      const likeData = {
        userID: this.userID,
        postID: this.post._id,
      };
      const config = {
        headers: {
          Authorization: this.$session.get('nu_social_t'),
        },
      };
      if (this.userLiked) {
        axios.patch('/api/removePostLike', likeData, config).then(() => {
          this.post.likes.splice(this.post.likes.indexOf(this.userLiked), 1);
        }).catch((error) => {
          window.console.log(error);
        });
      } else {
        axios.patch('/api/addPostLike', likeData, config).then((post) => {
          this.post.likes.push(post.data.likes[0]);
        }).catch((error) => {
          window.console.log(error);
        });
      }
    },
  },
  computed: {
    // returns the liked object or undefined
    userLiked() {
      return this.post.likes.find((element) => element.userId === this.userID);
    },
  },
};
</script>

<style scoped>
.liked {
  background: #007bff;
  color: #fff;
}
</style>
