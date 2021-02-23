<template>
<div>
  <b-container class='py-5' fluid>
    <b-row>

      <b-col offset-md='3' md='5' lg='5' >
        <b-row>
          <b-col sm="12" id='nuCreatePost'>
              <VueEditor
                class="richTextEditor"
                v-model='newPostText'
                :placeholder="editorOptions.placeholder"/>
               <b-button block variant="primary" @click="createNewPost">Post</b-button>
          </b-col>
        </b-row>
        <hr/>
        <b-row class="postColumn">
          <b-col sm="12" >
            <PostCard v-for="postObj in posts"
              :key="postObj._id"
              :postObj="postObj"
              :userID='userID'
            />
          </b-col>
        </b-row>
      </b-col>

      <b-col offset-md='1' md='3' lg='3'>
        <FriendList />
      </b-col>

    </b-row>

    <Modal ref='modal'/>

  </b-container>
  <Footer />
</div>
</template>

<script>
// @ is an alias to /src
import axios from 'axios';
import Vue from 'vue';
import { VueEditor } from 'vue2-editor';
import Modal from '../components/modal/Modal.vue';
import PostCard from '../components/PostCard.vue';
import FriendList from '../components/FriendList.vue';
import Bus from '../main';
import Footer from '../components/Footer.vue';

export default {
  name: 'Home',

  components: {
    PostCard,
    FriendList,
    Modal,
    VueEditor,
    Footer,
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
.postColumn{
 display: flex;
 justify-content: center;
}
</style>
