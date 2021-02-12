<template>
  <div>
    <b-card
      id="CommentCard"
      :title="comment.author"
    >
      <b-card-text>
        {{ common.stringToLocaleDate(comment.updatedAt) }}
      </b-card-text>
      <div v-if="editMode">
      <b-form-textarea v-if="editMode" v-model="comment.text"></b-form-textarea>
        <b-button variant="primary"
        @click="editComment()">Save</b-button>
      </div>
      <b-card-text v-else>
        {{ comment.text }}
      </b-card-text>
      <a href="#" class="card-link"
        :class="{ liked: userLiked }"
        @click="toggleCommentLike">Like
        ({{comment.likes.length}})</a>
      <b-link
        v-if="this.userID === this.comment.userID"
        href="#" class="card-link" @click="editMode=true"
        >Edit</b-link
      >
    </b-card>
  </div>
</template>

<script>
import axios from 'axios';
import common from '../helpers/common';

export default {
  name: 'Comment',
  props: {
    Comment: {},
    postID: String,
    userID: String,
  },
  data() {
    return {
      comment: this.Comment,
      editMode: false,
      common,
    };
  },
  methods: {
    editComment() {
      const config = {
        headers: {
          Authorization: this.$session.get('nu_social_t'),
        },
      };
      const data = {
        userID: this.userID,
        commentID: this.comment._id,
        text: this.comment.text,
      };
      // post to DB here with axios
      axios.patch('/api/editPostComment', data, config).then((comment) => {
        [this.comment] = comment.data.comments;
        this.editMode = false;
      }).catch((error) => {
        window.console.log(error);
      });
    },
    toggleCommentLike() {
      const likeData = {
        userID: this.userID,
        postID: this.postID,
        commentID: this.comment._id,
      };
      const config = {
        headers: {
          Authorization: this.$session.get('nu_social_t'),
        },
      };
      if (this.userLiked) {
        axios.patch('/api/removeCommentLike', likeData, config).then(() => {
          window.console.log('successfully removed like from comment');
        }).catch((err) => {
          window.console.log(err);
        });
      } else {
        axios.patch('/api/addCommentLike', likeData, config).then(((post) => {
          this.comment.likes.push(post.data.like);
        })).catch((err) => {
          window.console.log(err);
        });
      }
    },
  },
  computed: {
    userLiked() {
      return this.comment.likes.find((element) => element.userId === this.userID);
    },
  },
};
</script>

<style scoped>
  #CommentCard{
      background: #eaeaea;;
      color: #333;
   }

  .liked {
  background: #007bff;
  color: #fff;
  }

  .card-link{
    padding: 7px;
    border-radius: 7px;
  }

</style>
