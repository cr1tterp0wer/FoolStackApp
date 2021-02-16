<template>
<div>
  <b-container class='py-5'>
    <b-row>
      <b-col id='nuCreatePost'>
         <b-form-group
          label="Create a new post"
          id='nuCreatePostForm'>

           <b-form-textarea
            size="lg"
            placeholder="What's on your mind?"
            v-model="newPostText"
           ></b-form-textarea>
           <b-button block variant="primary" @click="createNewPost">Post</b-button>
           </b-form-group>
      </b-col>
    </b-row>
    <hr/>
    <div class='card-columns'>
      <PostCard v-for="postObj in posts"
      :key="postObj._id"
      :postObj="postObj"
      :userID='userID'
      />
    </div>
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

<style scoped lang="scss">

#nuCreatePostForm {
  margin-top: 50px;
}
#nuCreatePost {
  margin: auto;
  max-width: 30rem;

  .btn {
    margin-top: 1rem;
  }
}
.grid-2-col {
  display: grid;
  grid-template-columns: repeat(auto-fit, 30rem);
  justify-content: center;
  grid-gap: 2rem;
}
</style>
