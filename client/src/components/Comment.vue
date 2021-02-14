<template>
  <div>
    <b-card
      id="CommentCard"
      :title="comment.author"
    >
      <b-link v-if='isCommentOwner' @click="deleteComment" class="m-3 card-link nuDeleteComment" >
        <b-icon icon="trash"></b-icon>
      </b-link>
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
    <Modal ref='modal'/>
  </div>
</template>

<script>
import axios from 'axios';
import common from '../helpers/common';
import Modal from './modal/Modal.vue';
import Bus from '../main';

export default {
  name: 'Comment',

  props: {
    Comment: {},
    postID: String,
    userID: String,
  },

  components: {
    Modal,
  },

  data() {
    return {
      comment: this.Comment,
      editMode: false,
      isCommentOwner: false,
      common,
    };
  },

  mounted() {
    this.isCommentOwner = this.comment.userID === this.$store.state.userID;
  },

  methods: {

    /**
     * Updates a comment text
     */
    editComment() {
      const data = {
        userID: this.userID,
        commentID: this.comment._id,
        text: this.comment.text,
      };
      axios.patch('/api/posts/comments', data).then((comment) => {
        [this.comment] = comment.data.comments;
        this.editMode = false;
        this.$refs.modal.show([
          { body: 'Fine tuning?' },
          { body: 'Your comment has been updated.' },
        ], false);
      }).catch((error) => {
        this.$refs.modal.show([
          { body: error.message },
          { body: error.response.data.message },
        ]);
      });
    },

    /**
     * Deletes a comment
     */
    deleteComment() {
      axios.delete('/api/posts/comments', {
        data: {
          postID: this.postID,
          commentID: this.comment._id,
          userID: this.$store.state.userID,
        },
      })
        .then((success) => {
          if (success.data.success.nModified > 0) {
            Bus.$emit('commentDeleted', this.comment._id);
          } else {
            this.$refs.modal.show([
              { body: 'error' },
            ], true);
          }
        })
        .catch(() => {
          this.$refs.modal.show([
            { body: 'error' },
          ], true);
        });
    },

    /**
     * Toggles a like on/off
     */
    toggleCommentLike() {
      if (this.userLiked) {
        axios.delete('/api/posts/comments/likes', {
          data: {
            userID: this.userID,
            postID: this.postID,
            commentID: this.comment._id,
          },
        })
          .then((success) => {
            if (success.data.success.nModified > 0) {
              // successfully modified something, remove like from array
              this.comment.likes.splice(
                this.comment.likes.findIndex((el) => el.userID === this.userID), 1,
              );
            }
          }).catch((error) => {
            this.$refs.modal.show([
              { body: error.message },
              { body: error.response.data.message },
            ]);
          });
      } else {
        axios.post('/api/posts/comments/likes', {
          userID: this.userID,
          postID: this.postID,
          commentID: this.comment._id,
        }).then(((post) => {
          this.comment.likes.push(post.data.like);
        })).catch((error) => {
          this.$refs.modal.show([
            { body: error.message },
            { body: error.response.data.message },
          ]);
        });
      }
    },
  },

  computed: {
    userLiked() {
      return this.comment.likes.find((element) => element.userID === this.userID);
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

  .nuDeleteComment {
    position: absolute;
    top: 0;
    right: 0;
}

</style>