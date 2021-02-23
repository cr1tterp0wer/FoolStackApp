<template>
  <b-container fluid='lg'>
    <b-row>
      <b-card-group deck class='w-100'>
        <b-card header="Friends List">
          <b-list-group-item
            v-for="friend in this.friends"
            :key="friend._id"
            v-bind:variant="friend.friendsStatus | friendVariant"
            class="d-flex justify-content-between align-items-center">
              <div>
                <b-badge pill variant='primary' class='mr-1'>{{ friend.username }}</b-badge>
                <b-link
                  id='nuChat'
                  v-if='friend.friendsStatus == 3'
                  @click='displayChat(friend)'
                  size='sm'
                  class='ml-auto'>
                  <b-icon
                    class='nuChatIcon'
                    variant='info'
                    icon='chat-dots-fill'
                    scale='1.2'>
                  </b-icon>
                </b-link>
              </div>

              <b-link
                id='removeFriend'
                variant='danger'
                v-if='friend.friendsStatus != 2'
                @click='removeFriend(friend)'
                size='sm'
                class='ml-auto'>
                <b-icon
                  class='nuRemoveFriendIcon'
                  variant='danger'
                  icon='x-circle'
                  scale='1.2'>
                </b-icon>
              </b-link>

              <b-button-group v-else>
                <b-button
                  @click='confirmFriend(friend)'
                  size="sm"
                  variant='success'>Accept</b-button>
                <b-button
                  @click='removeFriend(friend)'
                  size="sm"
                  variant='outline-danger'>Decline</b-button>
              </b-button-group>
          </b-list-group-item>
        </b-card>
      </b-card-group>
    </b-row>

    <b-row>
      <b-card-group deck class='w-100' v-if='!this.$root.isEmpty(this.nonFriends)'>
        <b-card header="User List">
          <b-list-group-item
            v-for="nonFriend in this.nonFriends"
            :key="nonFriend._id"
            variant='light'
            class="d-flex justify-content-between align-items-center"
            >
              {{ nonFriend.username }}
              <b-link
                id='addFriend'
                variant='success'
                @click='addFriend(nonFriend)'
                size='sm'
                class='ml-auto'>
                <b-icon
                  class='nuAddFriendIcon'
                  variant='success'
                  icon='plus'
                  scale='1.2'>
                </b-icon>
              </b-link>
          </b-list-group-item>
        </b-card>
      </b-card-group>
    </b-row>

  <ChatBox v-bind:selectedPartner='chatPartner' v-if='this.showChat' />
  <Modal ref='modal' />
  </b-container>
</template>

<script>
/* eslint-disable no-param-reassign */
import axios from 'axios';
import Vue from 'vue';
import Modal from './modal/Modal.vue';
import ChatBox from './ChatBox.vue';

const NOT_FRIEND = 0;
const REQUESTED = 1;
const PENDING = 2;
const ACCEPTED = 3;

export default {
  name: 'FriendList',
  components: {
    Modal,
    ChatBox,
  },
  data() {
    return {
      userID: this.$store.state.userID,
      friends: {},
      nonFriends: {},
      chatPartner: null,
      showChat: false,
    };
  },
  methods: {
    displayChat(friend) {
      this.chatPartner = friend;

      if (!friend._chatID) {
        this.chatPartner.chatID = Array.isArray(friend.chatID) ? friend.chatID[0] : friend.chatID;
      } else {
        this.chatPartner.chatID = friend._chatID;
      }

      this.showChat = true;
    },

    destroyFriend(friend) {
      const data = {
        userID: this.userID,
        friendID: friend._id,
        accepted: false,
      };
      axios.patch('/api/friends', data).then(() => {
        Vue.delete(this.friends, friend._id);
        Vue.set(this.nonFriends, friend._id, friend);

        if (friend._id === this.chatPartner._id) {
          this.chatPartner = null;
          this.showChat = false;
        }
      }).catch((error) => {
        this.$refs.modal.show(
          [
            { body: error.message },
            { body: error.response.data.message },
          ],
        );
      });
    },

    removeFriend(friend) {
      this.$refs.modal.$once('ok', () => {
        this.destroyFriend(friend);
      });

      this.$refs.modal.show(
        [
          { body: `Removing ${friend.username} from FriendsList` },
          { body: 'THIS ACTION CANNOT BE UNDONE' },
        ],
        true,
      );
    },

    confirmFriend(friend) {
      const data = {
        userID: this.userID,
        friendID: friend._id,
        accepted: true,
      };
      axios.patch('/api/friends', data).then((res) => {
        res.data.forEach((user) => {
          if (user.friendsStatus === ACCEPTED) {
            Vue.set(this.friends, user._id, user);
            Vue.delete(this.nonFriends, user._id);
          }
        });
      }).catch((error) => {
        this.$refs.modal.show(
          [
            { body: error.message },
            { body: error.response.data.message },
          ],
        );
      });
    },

    addFriend(nonFriend) {
      const data = {
        userID: this.userID,
        friendID: nonFriend._id,
      };
      axios.post('/api/friends', data).then((res) => {
        res.data.forEach((friend) => {
          if (friend.friendsStatus > 0) {
            Vue.set(this.friends, friend._id, friend);
            Vue.delete(this.nonFriends, friend._id);
          }
        });
      }).catch((error) => {
        this.$refs.modal.show(
          [
            { body: error.message },
            { body: error.response.data.message },
          ],
        );
      });
    },
  },

  created() {
    this.sockets.subscribe(`friend-request-received:${this.userID}`, (friend) => {
      Vue.delete(this.nonFriends, friend._id);
      Vue.set(this.friends, friend._id, friend);
    });

    this.sockets.subscribe(`friend-request-accepted:${this.userID}`, (friend) => {
      Vue.delete(this.nonFriends, friend._id);
      Vue.set(this.friends, friend._id, friend);
    });

    this.sockets.subscribe(`friend-request-denied:${this.userID}`, (friend) => {
      Vue.delete(this.friends, friend._id);
      Vue.set(this.nonFriends, friend._id, friend);
      if (friend._id === this.chatPartner._id) {
        this.chatPartner = null;
        this.showChat = false;
      }
    });

    axios.get('/api/friends', { params: { userID: this.userID } }).then((res) => {
      res.data.forEach((user) => {
        if (user.friendsStatus > 0) Vue.set(this.friends, user._id, user);
        else Vue.set(this.nonFriends, user._id, user);
      });
    }).catch((error) => {
      this.$refs.modal.show(
        [
          { body: error.message },
          { body: error.response.data.message },
        ],
      );
    });
  },

  filters: {
    friendVariant: (value) => {
      let variant = 'light';
      switch (value) {
        case NOT_FRIEND:
          variant = 'light';
          break;
        case REQUESTED:
          variant = 'warning';
          break;
        case PENDING:
          variant = 'info';
          break;
        case ACCEPTED:
          variant = 'success';
          break;
        default:
          break;
      }
      return variant;
    },
  },
};
</script>

<style scoped lang="scss">
#nuChat {
  justify-self: left;
  justify-content: left;
}
#removeFriend {
  > svg.nuRemoveFriendIcon.bi-x-circle {
    border-radius: 50%;
    transition: 400ms;

    &:hover {
      background-color: red;
      fill: white;
      color: white;
    }
  }
}
</style>
