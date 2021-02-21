<template>
    <div class='nuPostCard mb-3 card'>
      <div class='card-header'>
        <div class="author">
          <div class="profilePic">
            <div class='letter'>{{post.author[0]}}</div>
          </div>
          <div class="lead">{{ post.author }}</div>
        </div>
          <div class='nuCardEditGroup'>
            <b-link v-if='isPostOwner' @click='editMode = !editMode' class='card-link nuEditCard'>
              <b-icon icon='pencil'></b-icon>
            </b-link>

            <b-link v-if='isPostOwner' @click='deletePost()' class='m-1 card-link nuDeleteCard'>
              <b-icon icon='trash'></b-icon>
            </b-link>
        </div>
      </div>

      <b-card-body>
        <div v-if='editMode'>
           <VueEditor
            class="richTextEditor"
            v-model='post.text'
            :placeholder="editorOptions.placeholder"
           />
          <b-button variant='primary' @click='editPost()'>Save</b-button>
          <b-button variant='danger' @click='editMode = false'>Cancel</b-button>
        </div>

        <b-card-text v-else v-html="post.text" class='postBody text-left'>
        </b-card-text>

        <div class="lead timeStamps">
          <p>{{ common.stringToLocaleDate(post.updatedAt ? post.updatedAt : post.createdAt) }}</p>
        </div>
        <hr />

        <div id='nuCardMetaGroup' class='w-100 m-auto'>
          <div class='nuLike '>
            <p :class='{ liked: userLiked }' class='px-2 py1' @click='TogglePostLike()'>
              <b-icon icon='hand-thumbs-up'></b-icon> {{ post.likes.length }}
            </p>
          </div>

          <div class='nuCommentLink'>
            <b-link @click='showComments = !showComments' class='card-link'>
              <b-icon icon='chat-quote-fill'></b-icon> {{ post.comments.length }}
            </b-link>
          </div>
        </div>

        <div v-if='showComments'>
          <Comment
            v-for='comment in post.comments'
            :key='comment._id'
            :Comment='comment'
            :postID='post._id'
            :userID='userID'
          />
        </div>

         <VueEditor
            class="richTextComment"
            v-model='newCommentText'
            :placeholder="editorOptions.placeholder"
           />

        <b-button variant='primary' @click='createNewComment()'>
          Comment
        </b-button>
      </b-card-body>
    <Modal ref='postModal' />
    </div>

</template>

<script>
import axios from 'axios';
import { VueEditor } from 'vue2-editor';
import Comment from './Comment.vue';
import common from '../helpers/common';
import Modal from './modal/Modal.vue';
import Bus from '../main';

export default {
  name: 'PostCard',

  components: {
    Comment,
    Modal,
    VueEditor,
  },

  props: {
    postObj: Object,
    userID: String,
  },

  data() {
    return {
      author: '',
      isPostOwner: false,
      post: this.postObj,
      newCommentText: '',
      showComments: false,
      editMode: false,
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

  created() {
    Bus.$on('commentDeleted', this.removeComment);
  },

  mounted() {
    this.isPostOwner = this.post.userID === this.$store.state.userID;
  },

  methods: {
    /**
     * Creates a new Comment on a Post
     */
    createNewComment() {
      const data = {
        userID: this.$store.state.userID,
        postID: this.post._id,
        text: this.newCommentText,
      };
      axios
        .post('/api/posts/comments', data)
        .then((comment) => {
          this.post.comments.push(comment.data.comments[0]);

          this.$refs.postModal.show(
            [{ body: 'Great Work!' }, { body: 'Your comments have been added.' }],
            false,
          );
        })
        .catch((error) => {
          this.$refs.postModal.show([
            { body: error.message },
            { body: error.response.data.message },
          ]);
        });
      this.newCommentText = '';
    },

    /**
     * Toggles a single like on a post object
     */
    TogglePostLike() {
      const likeData = { data: { userID: this.userID, postID: this.post._id } };
      if (this.userLiked) {
        axios
          .delete('/api/posts/likes', likeData)
          .then(() => {
            this.post.likes.splice(this.post.likes.indexOf(this.userLiked), 1);
          })
          .catch((error) => {
            this.$refs.postModal.show([
              { body: error.message },
              { body: error.response.data.message },
            ]);
          });
      } else {
        axios
          .post('/api/posts/likes', likeData.data)
          .then((post) => {
            this.post.likes.push(post.data.likes[0]);
          })
          .catch((error) => {
            this.$refs.postModal.show([
              { body: error.message },
              { body: error.response.data.message },
            ]);
          });
      }
    },

    /**
     * Changes the post text
     */
    editPost() {
      axios
        .patch('/api/posts', {
          postID: this.post._id,
          userID: this.post.userID,
          text: this.post.text,
        })
        .then((success) => {
          this.post.updatedAt = success.data.updatedAt;
          this.post.text = success.data.text;
          this.editMode = false;
        })
        .catch((err) => {
          this.$refs.postModal.show([{ body: err.message }, { body: err.response.data.message }]);
        });
    },

    /**
     * Deletes a single post
     */
    deletePost() {
      axios
        .delete('/api/posts', { data: { postID: this.post._id, userID: this.userID } })
        .then(() => {
          Bus.$emit('postDeleted', this.post._id);
        })
        .catch((error) => {
          this.$refs.postModal.show([
            { body: error.message },
            { body: error.response.data.message },
          ]);
        });
    },

    /**
     * Removes a comment in this post
     */
    removeComment(commentID) {
      const index = this.post.comments.findIndex((element) => element._id === commentID);
      this.post.comments.splice(index, 1);
    },
  },

  computed: {
    userLiked() {
      return this.post.likes.find((element) => element.userID === this.userID);
    },
  },
};
</script>

<style scoped lang="scss">
.btn {
  margin-top: 1rem;
}
.card {
  min-width: 350px;
  color: white;
  font-size: 1.3rem;
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
.postBody{
  max-height: 250px;
  overflow-y: auto;
}

</style>
