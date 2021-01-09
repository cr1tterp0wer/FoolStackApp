<template>
  <div class="home">
    <h1>Hello</h1>
    <div class='postcard' v-for="post in posts" :key="post._id">
      <h1>{{post.text}}</h1>
      <h1>{{post.createdBy}}</h1>
      <h1>{{post.createdAt}}</h1>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import axios from 'axios';

export default {
  name: 'Home',
  components: {
    // HelloWorld,
  },
  data() {
    return {
      posts: [],
    };
  },
  created() {
    axios.get('http://localhost:5000/api/getAllPosts').then((res) => {
      window.console.log(res);
      this.posts = res.data;
    });
  },
};
</script>

<style scoped>
.postcard{
  background: #333;
  color: #fff;
}
.postcard:hover{
  background: rgb(49, 89, 171);
}
</style>
