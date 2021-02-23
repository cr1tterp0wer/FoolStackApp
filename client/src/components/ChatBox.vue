<template>
  <b-row id="nuChatArea" class='mr-3'>
    <b-card-group deck class="w-100">

      <b-card no-body no-header>

        <b-card-header flush>
          Live Chat: {{ this.partner.username }}
          <b-link
            id='closeChat'
            variant='danger'
            @click='closeChat()'
            size='md'
            class='ml-auto'>
            <b-icon
              class='nuRemoveFriendIcon'
              variant='danger'
              icon='x-circle'
              scale='1.2'>
            </b-icon>
          </b-link>
        </b-card-header>

        <b-card-body>
          <b-list-group>

            <div
              :class="isMine(msg.userID) ? 'nuTextBubble nuMine offset-sm-4 col-sm-8'
              : 'nuTextBubble nuNotMine col-sm-12'"
              v-for="msg in this.chatLog"
              :key="msg._id"
              >

              <p
                class='card-text py-2 px-3 mr-2'
                :class="isMine(msg.userID) ? 'bg-light text-primary' : 'bg-dark text-light'"
              >
                {{ msg.message }}
              </p>

              <div class='nuBadgeWrap'>
                <b-badge
                  pill
                  :variant="isMine(msg.userID) ? 'secondary' : 'light'"
                  class="mr-1 userBadge">
                  {{ isMine(msg.userID) ? "You" : partner.username }}
                </b-badge>
              </div>
              <span class="text-secondary postDate">
                {{ $root.stringToLocaleDate(msg.createdAt) }}
              </span>
            </div>

          </b-list-group>
        </b-card-body>

        <b-card-footer flush>
          <b-form class="container-fluid">
            <b-row>
              <textarea class="col-sm-8" v-model="currentText" id="nuChatText" rows="1"></textarea>
              <b-button @click="sendMessage()" class="col-sm-4" size="sm" variant="primary">
                Send
              </b-button>
            </b-row>
          </b-form>
        </b-card-footer>
      </b-card>
    </b-card-group>
    <Modal ref="modal" />
  </b-row>
</template>

<script>
import axios from 'axios';
import Vue from 'vue';
import Modal from './modal/Modal.vue';
import Bus from '../main';

export default {
  name: 'ChatBox',
  props: {
    selectedPartner: Object,
  },
  components: {
    Modal,
  },

  data() {
    return {
      chatID: this.selectedPartner.chatID,
      user: this.$store.state.user,
      userID: this.$store.state.userID,
      partner: this.selectedPartner,
      currentText: '',
      chatLog: {},
    };
  },
  mounted() {
    this.partner = this.selectedPartner;
    this.chatID = this.partner.chatID; // eslint-disable-line prefer-destructuring

    axios
      .get('/api/messages', {
        params: { userID: this.userID, friendID: this.partner._id, channel: 0 },
      })
      .then((res) => {
        res.data.forEach((msg) => {
          Vue.set(this.chatLog, msg._id, msg);
        });
      })
      .catch((error) => {
        this.$refs.modal.show(
          [
            { body: error.message },
            { body: error.response.data.message },
          ],
        );
      });

    this.sockets.subscribe(`chat-update:${this.chatID}`, (messages) => {
      this.chatLog = messages;
    });
  },
  methods: {
    isMine(id) {
      return this.userID === id;
    },
    closeChat() {
      Bus.$emit('closeChat', this.partner);
    },
    sendMessage() {
      if (!this.currentText.length) {
        this.$refs.modal.show([{ body: 'You must input a message body before submitting' }], true);
      } else {
        const data = {
          userID: this.userID,
          friendID: this.partner._id,
          channel: 0,
          message: this.currentText,
        };
        axios
          .post('/api/messages', data)
          .then((res) => {
            const msg = res.data;
            Vue.set(this.chatLog, msg._id, msg);
          })
          .catch((error) => {
            this.$refs.modal.show([{ body: error.message }, { body: error.response.data.message }]);
          });
      }
      this.currentText = '';
    },
  },
};
</script>
<style lang='scss'>
#nuChatArea {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 200;

  .card {
    min-width: 350px;
  }

  .postDate {
    position: absolute;
    top: auto;
    bottom: -20px;
    left: auto;
    right: 0;
    width: max-content;
    font-weight: bold;
    font-size: 12px;
  }

  #nuChatText {
    resize: vertical;
    border-radius: 3px;
  }
  .list-group {
    width: 100%;
  }
  .nuTextBubble {
    position: relative;
    padding:0;
    margin: 1rem 0;
    display: inline-flex;
    align-self: flex-end;
    align-items: center;

    &.nuNotMine {
      .postDate {
        right: auto;
        left: 0;
      }
    }
  }
  .card-text {
    border-radius: 30px;
    margin:0;
  }
  .card-body {
    display: flex;
    flex-direction: column-reverse;
    align-items: flex-end;
    min-height: 300px;
    max-height: 450px;
    overflow-y: auto;
  }
}
</style>
