<template>
  <b-container>
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
        <b-card v-for="postObj in posts"
          :key="postObj._id" :title="postObj.createdBy" >
          <b-card-text>
            {{ postObj.text }}
          </b-card-text>
          <a href="#" class="card-link" @click="LikePost(postObj._id)">Like</a>
          <b-link href="#" class="card-link">Comment</b-link>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
// @ is an alias to /src
import axios from 'axios';
import Vue from 'vue';

export default {
  name: 'Home',
  components: {

  },
  data() {
    return {
      posts: {},
      newPostText: '',
    };
  },
  created() {
    axios.get('/api/getAllPosts').then((res) => {
      window.console.log(res);
      // this.posts = res.data;
      res.data.forEach((post) => {
        Vue.set(this.posts, post._id, post);
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
      }).catch((error) => {
        throw (error);
      });
      this.newPostText = '';
    },
    LikePost(PostID) {
      // perform an axios.patch() to the specific endpoint
      // and feed the proper data
      window.console.log(`liked button has been clicked ${PostID}`);
      axios.patch('/api/addPostLike', {
        userId: '6009d55f02c9577e51a17c1d',
        postId: PostID,
      }).then((like) => {
        window.console.log(like);
        this.posts[PostID].likes.push(like.data.msg);
      }).catch((error) => {
        window.console.log(error);
      });
    },
  },
};
</script>

<style scoped lang="scss">
</style>
