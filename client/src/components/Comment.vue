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
      <a href="#" class="card-link">Like</a>
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
  },
};
</script>

<style scoped>
 #CommentCard{
    background: gray;
    }
</style>
