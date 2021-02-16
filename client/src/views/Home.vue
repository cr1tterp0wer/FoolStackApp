<template>
<div>
  <b-container class='py-5'>
    <b-row class='py-5 mx-auto'>
      <b-col>
        <b-button variant='outline-danger' @click='DeleteAllPosts'>
          Delete All Posts
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
         <b-form-textarea
          size="lg"
          placeholder="What's on your mind?"
          v-model="newPostText"
         ></b-form-textarea>
         <b-button block variant="outline-primary" @click="createNewPost">Post</b-button>
      </b-col>
    </b-row>
    <hr/>
    <b-row>
      <b-col>
        <PostCard v-for="postObj in posts" :key="postObj._id" :postObj="postObj" :userID='userID' />
        <br>
      </b-col>
    </b-row>
    <Modal ref='modal'/>
  </b-container>
</div>
</template>

<script>
// @ is an alias to /src
import axios from 'axios';
import Vue from 'vue';
import Modal from '../components/modal/Modal.vue';
import PostCard from '../components/PostCard.vue';
import Bus from '../main';

export default {
  name: 'Home',

  components: {
    PostCard,
    Modal,
  },

  data() {
    return {
      posts: {},
      newPostText: '',
      userID: this.$store.state.userID,
    };
  },

  created() {
    Bus.$on('postDeleted', this.removePost);
    axios.get('/api/posts').then((res) => {
      res.data.forEach((post) => {
        Vue.set(this.posts, post._id, post);
      });
    }).catch((error) => {
      if (error.response.data.message === 'PROTECTED') {
        this.$router.push('/login');
      }
    });
  },

  methods: {

    /**
     * Creates a new Post
     */
    createNewPost() {
      const data = {
        text: this.newPostText,
        userID: this.userID,
      };
      axios.post('/api/posts', data).then((res) => {
        Vue.set(this.posts, res.data._id, res.data);
      }).catch((error) => {
        this.$refs.modal.show([{ body: error.response.data.message }]);
        throw (error);
      });
      this.newPostText = '';
    },

    removePost(postID) {
      Vue.delete(this.posts, postID);
    },

    /**
     * Deletes all Posts
     */
    DeleteAllPosts() {
      axios.delete('/api/drop-posts').then(() => {
        this.posts = {};
      });
    },
  },
};
</script>
