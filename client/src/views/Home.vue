<template>
  <b-container>
    {{newPostText}}
    hello
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
        <b-card v-for="post in posts"
          :key="post._id" :title="post.createdBy" >
          <b-card-text>
            {{ post.text }}
          </b-card-text>
          <a href="#" class="card-link">Like</a>
          <b-link href="#" class="card-link" @click="createNewComment">Comment</b-link>
            <b-card v-for="comment in comments"
              :key="comment._id">
              <b-card-text>
               {{ comment.text }}
              </b-card-text>
              <a href="#" class="card-link">Like</a>
            </b-card>
            <b-form-textarea
              size="sm"
              placeholder="What's on your mind?"
              v-model="newCommentText"
            ></b-form-textarea>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
// @ is an alias to /src
import axios from 'axios';

export default {
  name: 'Home',
  components: {

  },
  data() {
    return {
      posts: [],
      comments: [],
      newPostText: '',
      newCommentText: '',
    };
  },
  created() {
    axios.get('/api/getAllPosts').then((res) => {
      window.console.log(res);
      this.posts = res.data;
    });
    axios.get('/api/getAllPostComments').then((res) => {
      window.console.log(res);
      this.comments = res.data;
    });
  },
  methods: {
    createNewPost() {
      // post to DB here with axios
      axios.post('/api/createPost', {
        text: this.newPostText,
        createdBy: 'Dylan',
      }).then((res) => {
        this.posts.push(res.data);
      }).catch((error) => {
        throw (error);
      });
      this.newPostText = '';
    },
    createNewComment() {
      // post to DB here with axios
      axios.post('/api/addPostComment', {
        postId: this.posts[0].ObjectId,
        comment: this.newCommentText,
      }).then((res) => {
        this.comments.push(res.data);
      }).catch((error) => {
        throw (error);
      });
      this.newCommentText = '';
    },
  },
};
</script>

<style scoped lang="scss">
</style>
