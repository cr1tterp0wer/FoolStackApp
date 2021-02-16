<template>
  <div class='my-3'>
    <div class='card border-info'>
      <div class='card-header'>
        <div>{{ comment.author }}</div>
        <div>{{ common.stringToLocaleDate(comment.updatedAt) }}</div>
      </div>

      <b-card-body>
        <div v-if="editMode">
          <b-form-textarea v-if="editMode" v-model="comment.text"></b-form-textarea>
            <b-button class='' variant="primary"
            @click="editComment()">Save</b-button>
        </div>
        <b-card-text v-else>
          {{ comment.text }}
        </b-card-text>

        <hr>

        <div class='nuCardEditGroup justify-content-between'>
          <div class='nuLike'>
            <p class="card-link px-2 py1"
              :class="{ liked: userLiked }"
              @click="toggleCommentLike">
                <b-icon icon='hand-thumbs-up'></b-icon> {{comment.likes.length}}
            </p>
          </div>

          <div v-if='isCommentOwner' >
            <b-link href="#" class="card-link nuEditCard" @click="editMode=true">
              <b-icon icon='pencil'></b-icon>
            </b-link>

            <b-link @click="deleteComment" class="card-link nuDeleteCard m-1" >
              <b-icon icon="trash"></b-icon>
            </b-link>
          </div>

        </div>

      </b-card-body>
    </div>
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

<style scoped lang="scss">
.btn {
  margin-top: 1rem;
}
</style>
