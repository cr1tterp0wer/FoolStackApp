<template>
  <div class='mb-3'>
    <div class='card'>
      <div class='card-header'>
        <div class="author">
         <div class="profilePic">{{comment.author[0]}}</div>
         <div class="lead">{{ comment.author }}</div>
        </div>
        <div v-if='isCommentOwner' class="nuCardEditGroup" >
            <b-link href="#" class="card-link nuEditCard" @click="editMode=true">
              <b-icon icon='pencil'></b-icon>
            </b-link>

            <b-link @click="deleteComment" class="card-link nuDeleteCard m-1" >
              <b-icon icon="trash"></b-icon>
            </b-link>
          </div>
      </div>

      <b-card-body>
        <div v-if="editMode">
          <!-- <b-form-textarea v-if="editMode" v-model="comment.text"></b-form-textarea> -->
            <VueEditor
              class="richTextComment"
              v-model='comment.text'
              :placeholder="editorOptions.placeholder"
             />
            <b-button class='' variant="primary"
            @click="editComment()">Save</b-button>
        </div>
        <b-card-text v-html="comment.text" v-else>
        </b-card-text>

        <div class="lead timeStamps">
          <p>{{ common.stringToLocaleDate(
            comment.updatedAt ? comment.updatedAt : comment.createdAt) }}</p>
        </div>
        <hr>

        <div class='nuCardEditGroup justify-content-between'>
          <div class='nuLike'>
            <p class="card-link px-2 py1"
              :class="{ liked: userLiked }"
              @click="toggleCommentLike">
                <b-icon icon='hand-thumbs-up'></b-icon> {{comment.likes.length}}
            </p>
          </div>

        </div>

      </b-card-body>
    </div>
    <Modal ref='modal'/>
  </div>
</template>

<script>
import axios from 'axios';
import { VueEditor } from 'vue2-editor';
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
    VueEditor,
  },

  data() {
    return {
      comment: this.Comment,
      editMode: false,
      isCommentOwner: false,
      editorOptions: {
        placeholder: 'Add a comment!',
      },
      customToolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
      ],
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

.timeStamps{
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  p{
    margin: 0;
  }
  font-size: .8rem;
}
</style>
