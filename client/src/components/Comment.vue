<template>
  <div>
    <b-card
      id="CommentCard"
      :title="comment.createdBy"
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
        v-if="this.userId === this.comment.userId"
        href="#" class="card-link" @click="editMode=true"
        >Edit</b-link
      >x
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
    postId: String,
    userId: String,
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
      // post to DB here with axios
      axios.patch('/api/editPostComment', {
        userId: this.userId,
        postId: this.postId,
        commentId: this.comment._id,
        text: this.comment.text,
      }).then((commenter) => {
        const returnedComment = commenter.data.comments[0];
        this.comment = returnedComment;
      }).catch((error) => {
        window.console.log(error);
      });
      this.editMode = false;
    },
  },
};
</script>

<style scoped>
 #CommentCard{
    background: gray;
    }
</style>
