<template>

  <div class="mb-4">

    <b-card :title="post.author">

      <b-link v-if='isPostOwner' @click="deletePost()" class="m-3 card-link nuDeletePost" >
        <b-icon icon="trash"></b-icon>
      </b-link>

      <b-link v-if='isPostOwner' @click="editMode=!editMode" class="m-3 card-link nuEditPost" >
        <b-icon icon="pencil"></b-icon>
      </b-link>

      <b-card-text>
        {{ common.stringToLocaleDate(post.updatedAt ? post.updatedAt : post.createdAt) }}
      </b-card-text>

      <div v-if="editMode">
        <b-form-textarea v-if="editMode" v-model="post.text"></b-form-textarea>
          <b-button variant="primary"
          @click="editPost()">Save</b-button>
          <b-button variant="danger"
          @click="editMode=false">Cancel</b-button>
      </div>
      <b-card-text v-else>
        {{ post.text }}
      </b-card-text>

      <p :class="{ liked: userLiked }" @click="TogglePostLike()">
        Like ({{ post.likes.length }})
      </p>

      <b-link
       @click="showComments = !showComments"
       class="card-link">
         Comments ({{ post.comments.length }})
      </b-link>

      <div v-if="showComments">

       <Comment
        v-for="comment in post.comments"
        :key="comment._id"
        :Comment="comment"
        :postID='post._id'
        :userID="userID"/>
      </div>

      <b-form-textarea
        size="sm"
        placeholder="What's on your mind?"
        v-model="newCommentText">
      </b-form-textarea>

      <b-button
       variant="outline-primary"
       @click="createNewComment()">
         Comment
      </b-button>

    </b-card>

    <Modal ref='postModal'/>
  </div>

</template>

<script>
import axios from 'axios';
import Comment from './Comment.vue';
import common from '../helpers/common';
import Modal from './modal/Modal.vue';
import Bus from '../main';

export default {
  name: 'PostCard',

  components: {
    Comment,
    Modal,
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
      common,
    };
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
      axios.post('/api/posts/comments', data).then((comment) => {
        this.post.comments.push(comment.data.comments[0]);

        this.$refs.postModal.show([
          { body: 'Great Work!' },
          { body: 'Your comments have been added.' },
        ], false);
      }).catch((error) => {
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
        axios.delete('/api/posts/likes', likeData).then(() => {
          this.post.likes.splice(this.post.likes.indexOf(this.userLiked), 1);
        }).catch((error) => {
          this.$refs.postModal.show([
            { body: error.message },
            { body: error.response.data.message },
          ]);
        });
      } else {
        axios.post('/api/posts/likes', likeData.data).then((post) => {
          this.post.likes.push(post.data.likes[0]);
        }).catch((error) => {
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
      axios.patch('/api/posts', {
        postID: this.post._id,
        userID: this.post.userID,
        text: this.post.text,
      }).then((success) => {
        this.post.updatedAt = success.data.updatedAt;
        this.post.text = success.data.text;
        this.editMode = false;
      }).catch((err) => {
        this.$refs.postModal.show([
          { body: err.message },
          { body: err.response.data.message },
        ]);
      });
    },

    /**
     * Deletes a single post
     */
    deletePost() {
      axios.delete('/api/posts', { data: { postID: this.post._id, userID: this.userID } }).then(() => {
        Bus.$emit('postDeleted', this.post._id);
      }).catch((error) => {
        this.$refs.postModal.show([
          { body: error.message },
          { body: error.response.data.message },
        ]);
      });
    },
  },

  computed: {
    userLiked() {
      return this.post.likes.find((element) => element.userID === this.userID);
    },
  },
};
</script>

<style scoped>
.liked {
  background: #5471d3;
  color: #fff;
}
.nuDeletePost {
  position: absolute;
  top: 0;
  right: 0;
}
.nuEditPost{
  position: absolute;
  top: 0;
  left: 0;
}
</style>
