<template>
<div>
  <b-container class='py-5'>
    <b-row>
      <b-col sm="12" md="10" id='nuCreatePost'>
         <!-- <b-form-group
          label="Create a new post"
          id='nuCreatePostForm'> -->
          <VueEditor
            class="richTextEditor"
            v-model='newPostText'
            :placeholder="editorOptions.placeholder"/>
           <!-- <b-form-textarea
            class="postText"
            size="lg"
            placeholder="What's on your mind?"
            v-model="newPostText"
           ></b-form-textarea> -->
           <b-button block variant="primary" @click="createNewPost">Post</b-button>
           <!-- </b-form-group> -->
      </b-col>
    </b-row>
    <hr/>
    <b-row class="postColumn">
      <b-col sm="12" md="10">
        <PostCard v-for="postObj in posts"
          :key="postObj._id"
          :postObj="postObj"
          :userID='userID'
        />
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
import { VueEditor } from 'vue2-editor';
import Modal from '../components/modal/Modal.vue';
import PostCard from '../components/PostCard.vue';
import Bus from '../main';

export default {
  name: 'Home',

  components: {
    PostCard,
    Modal,
    VueEditor,
  },

  data() {
    return {
      posts: {},
      newPostText: '',
      editorOptions: {
        placeholder: 'What\'s on your mind',
      },
      customToolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
      ],
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
        this.posts = { ...{ [res.data._id]: res.data }, ...this.posts };
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

  .btn {
    margin-top: 1rem;
  }
}
// .richTextEditor{
//   background: #fff;
//   margin-top: 20px;
//   color: #333;
// }
.postColumn{
 display: flex;
 justify-content: center;
}
</style>
