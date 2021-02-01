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
        <b-card v-for="postObj in posts"
          :key="postObj._id" :title="postObj.createdBy" >
          <b-card-text>
            {{ stringToLocaleDate(postObj.createdAt) }}
          </b-card-text>
          <b-card-text>
            {{ postObj.text }}
          </b-card-text>
          <a
            href="#"
            class="card-link"
            @click="LikePost(postObj._id)">Like ({{postObj.likes.length}})
          </a>
          <b-link @click="showComments=!showComments"
          class="card-link">Comments ({{postObj.comments.length}})</b-link>
          <div v-if="showComments">
            <b-card  id="CommentCard" v-for="comment in postObj.comments"
              :key="comment._id" :title="comment.createdBy">
              <b-card-text>
                {{ stringToLocaleDate(comment.updatedAt)}}
              </b-card-text>
              <b-card-text>
                {{ comment.text }}
              </b-card-text>
              <a href="#" class="card-link">Like</a>
              <b-link href="#" class="card-link"
                @click="editComment(postObj._id, comment._id, comment.text)"
              >Edit</b-link>
                <b-form-textarea
                  size="sm"
                  placeholder="What do you want to edit?"
                  v-model="comment.text"
                ></b-form-textarea>
            </b-card>
          </div>
            <b-form-textarea
              size="sm"
              placeholder="What's on your mind?"
              v-model="newCommentText[postObj._id]"
            ></b-form-textarea>
            <b-button variant="outline-primary"
              @click="createNewComment(postObj._id)">Comment</b-button>
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
      newCommentText: {},
      newEditText: {},
      showComments: false,
      userId: '600a4745b0fe8908e83e2f1a',
    };
  },
  created() {
    axios.get('/api/getAllPosts').then((res) => {
      window.console.log(res);
      // this.posts = res.data;
      res.data.forEach((post) => {
        Vue.set(this.posts, post._id, post);
        Vue.set(this.newCommentText, post._id, '');
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
        Vue.set(this.newCommentText, res.data._id, '');
      }).catch((error) => {
        throw (error);
      });
      this.newPostText = '';
    },
    createNewComment(PostId) {
      // post to DB here with axios
      axios.patch('/api/addPostComment', {
        userId: this.userId,
        postId: PostId,
        text: this.newCommentText[PostId],
        createdBy: 'Elliot',
      }).then((commenter) => {
        window.console.log(commenter.data);
        this.posts[PostId].comments.push(commenter.data.comments[0]);
      }).catch((error) => {
        throw (error);
      });
      this.newCommentText[PostId] = '';
    },
    editComment(PostId, CommentId, Text) {
      // post to DB here with axios
      axios.patch('/api/editPostComment', {
        userId: this.userId,
        postId: PostId,
        commentId: CommentId,
        text: Text,
      }).then((commenter) => {
        const returnedComment = commenter.data.comments[0];
        const commentMatch = this.posts[PostId].comments.find(
          (element) => element._id === CommentId,
        );
        commentMatch.updatedAt = returnedComment.updatedAt;
        commentMatch.text = returnedComment.text;
      });
    },
    LikePost(PostID) {
      axios.patch('/api/addPostLike', {
        userId: this.userId,
        postId: PostID,
      }).then((like) => {
        window.console.log(like);
        this.posts[PostID].likes.push(like.data.msg.likes[0]);
      }).catch((error) => {
        window.console.log(error);
      });
    },
    stringToLocaleDate(stringDate) {
      const date = new Date(stringDate);
      return `${date.toLocaleDateString('en-US')} ${date.toLocaleTimeString()}`;
    },

    DeleteAllPosts() {
      axios.post('/api/deleteAllPosts');
    },
  },
};
</script>

<style scoped>
#CommentCard{
  background: gray;
}
</style>
