<template>
  <div class="w-100">
    <b-col>
      <h4>Friends List</h4>
      <b-list-group class="w-100 mb-3">
        <b-list-group-item
          v-for="friend in this.friends"
          :key="friend._id"
          @click="friend.friendsStatus === 3 ? toggleChat(friend) : null"
          class="nuFriendItem d-flex justify-content-between align-items-center border-0"
        >
          <div class="d-flex align-items-center justify-content-between">
            <div class="profilePicLight">{{ friend.username[0].toUpperCase() }}</div>
            <div class="mr-2">
              {{ friend.username }}
            </div>
            <b-badge
              class="text-primary nuPendingFriend"
              v-if="friend.friendsStatus == 1"
              sm
              variant="warning"
            >
              pending
            </b-badge>
          </div>
          <b-link
            id="removeFriend"
            variant="danger"
            v-if="friend.friendsStatus != 2"
            @click.stop="removeFriend(friend)"
            size="sm"
            class="ml-auto"
          >
            <b-icon class="nuRemoveFriendIcon" variant="danger" icon="x-circle" scale="1.2">
            </b-icon>
          </b-link>

          <b-button-group v-else>
            <b-button @click="confirmFriend(friend)" size="sm" variant="success">Accept</b-button>
            <b-button @click.stop="removeFriend(friend)" size="sm" variant="outline-danger"
              >Decline</b-button
            >
          </b-button-group>
        </b-list-group-item>
      </b-list-group>

      <h4>Add Other Members</h4>
      <b-list-group class="w-100" v-if="!this.$root.isEmpty(this.nonFriends)">
        <b-list-group-item
          v-for="nonFriend in this.nonFriends"
          :key="nonFriend._id"
          class="nuFriendItem d-flex justify-content-between align-items-center"
          :title="`Send friend invite to ${nonFriend.username}`"
        >
          <div class="d-flex align-items-center justify-content-between">
            <div class="profilePicLight">{{ nonFriend.username[0].toUpperCase() }}</div>
            <div class="mr-2">
              {{ nonFriend.username }}
            </div>
          </div>
          <b-link
            id="addFriend"
            variant="success"
            @click="addFriend(nonFriend)"
            size="lg"
            class="ml-auto"
          >
            <b-icon class="nuAddFriendIcon" variant="light" icon="plus" scale="1.2"> </b-icon>
          </b-link>
        </b-list-group-item>
      </b-list-group>
    </b-col>
    <Modal ref="modal" />
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */
import Bus from "../main";
import Modal from "./modal/Modal.vue";
import Vue from "vue";
import axios from "axios";

const ACCEPTED = 3,
  NOT_FRIEND = 0,
  PENDING = 2,
  REQUESTED = 1;
export default {
  name: "FriendList",
  components: {
    Modal,
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
    toggleChat(friend) {
      Bus.$emit("toggleChat", friend);
    },
    destroyFriend(friend) {
      const data = {
        userID: this.userID,
        friendID: friend._id,
        accepted: false,
      };
      axios
        .patch("/api/friends", data)
        .then(() => {
          Vue.delete(this.friends, friend._id);
          Vue.set(this.nonFriends, friend._id, friend);

          if (friend._id === this.chatPartner._id) {
            this.chatPartner = null;
            this.showChat = false;
          }
        })
        .catch((error) => {
          this.$refs.modal.show([{ body: error.message }, { body: error.response.data.message }]);
        });
    },

    removeFriend(friend) {
      this.$refs.modal.$once("ok", () => {
        this.destroyFriend(friend);
      });

      this.$refs.modal.show(
        [
          { body: `Removing ${friend.username} from FriendsList` },
          { body: "THIS ACTION CANNOT BE UNDONE" },
        ],
        true
      );
    },

    confirmFriend(friend) {
      const data = {
        userID: this.userID,
        friendID: friend._id,
        accepted: true,
      };
      axios
        .patch("/api/friends", data)
        .then((res) => {
          res.data.forEach((user) => {
            if (user.friendsStatus === ACCEPTED) {
              Vue.set(this.friends, user._id, user);
              Vue.delete(this.nonFriends, user._id);
            }
          });
        })
        .catch((error) => {
          this.$refs.modal.show([{ body: error.message }, { body: error.response.data.message }]);
        });
    },

    addFriend(nonFriend) {
      const data = {
        userID: this.userID,
        friendID: nonFriend._id,
      };
      axios
        .post("/api/friends", data)
        .then((res) => {
          res.data.forEach((friend) => {
            if (friend.friendsStatus > 0) {
              Vue.set(this.friends, friend._id, friend);
              Vue.delete(this.nonFriends, friend._id);
            }
          });
        })
        .catch((error) => {
          this.$refs.modal.show([{ body: error.message }, { body: error.response.data.message }]);
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

    axios
      .get("/api/friends", { params: { userID: this.userID } })
      .then((res) => {
        res.data.forEach((user) => {
          if (user.friendsStatus > 0) {
            Vue.set(this.friends, user._id, user);
          } else {
            Vue.set(this.nonFriends, user._id, user);
          }
        });
      })
      .catch((error) => {
        this.$refs.modal.show([{ body: error.message }, { body: error.response.data.message }]);
      });
  },

  filters: {
    friendVariant: (value) => {
      let variant = "light";
      switch (value) {
        case NOT_FRIEND:
          variant = "light";
          break;
        case REQUESTED:
          variant = "warning";
          break;
        case PENDING:
          variant = "info";
          break;
        case ACCEPTED:
          variant = "success";
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
.nuFriendItem {
  transition: 300ms;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.4) !important;
  }
}

#nuChat {
  justify-self: left;
  justify-content: left;
}
#removeFriend {
  z-index: 100;
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
