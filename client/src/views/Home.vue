<template>
  <b-container>
    <b-button variant='outline-danger' @click='DeleteAllPosts'>
      Delete All Posts
    </b-button>
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
        <PostCard v-for="postObj in posts" :key="postObj._id" :postObj="postObj" :userId='userId' />
        <br>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
// @ is an alias to /src
import axios from 'axios';
import Vue from 'vue';
import PostCard from '../components/PostCard.vue';

export default {
  name: 'Home',
  components: {
    PostCard,
  },
  data() {
    return {
      posts: {},
      newPostText: '',
      userId: '6009d55f02c9577e51a17c1d',
    };
  },
  created() {
    axios.get('/api/getAllPosts').then((res) => {
      window.console.log(res);
      // this.posts = res.data;
      res.data.forEach((post) => {
        Vue.set(this.posts, post._id, post);
        // Vue.set(this.newCommentText, post._id, '');
      });
    });
  },
  methods: {
    createNewPost() {
      // post to DB here with axios
      axios.post('/api/createPost', {
        text: this.newPostText,
        createdBy: 'Dylan',
      }).then((res) => {
        // this.posts.push(res.data);
        Vue.set(this.posts, res.data._id, res.data);
        // Vue.set(this.newCommentText, res.data._id, '');
      }).catch((error) => {
        throw (error);
      });
      this.newPostText = '';
    },
    DeleteAllPosts() {
      axios.post('/api/deleteAllPosts');
    },
  },
};
</script>

<style scoped>

</style>
