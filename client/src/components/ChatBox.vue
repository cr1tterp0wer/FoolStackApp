<template>
  <b-row id="nuChatArea">
    <b-card-group deck class="w-100">
      <b-card :header="'Live Chat: ' + this.partner.username">
        <b-list-group-item
          class="nuTextBubble"
          v-for="msg in this.chatLog"
          :key="msg._id"
          :variant="isMine(msg.userID) ? 'light' : 'info'"
        >
          <b-card-text :class="isMine(msg.userID) ? 'text-right' : ''">
            {{ msg.message }}
          </b-card-text>
          <div
            :class="
              isMine(msg.userID) ? 'd-flex justify-content-end' : 'd-flex justify-content-begin'
            "
          >
            <b-badge pill :variant="isMine(msg.userID) ? 'secondary' : 'light'" class="mr-1">
              {{ isMine(msg.userID) ? "You" : partner.username }}
            </b-badge>
            <b-badge pill :variant="isMine(msg.userID) ? 'secondary' : 'light'" class="mr-1">
              {{ $root.stringToLocaleDate(msg.createdAt) }}
            </b-badge>
          </div>
        </b-list-group-item>

        <b-form class="container-fluid">
          <b-row>
            <textarea class="col-sm-8" v-model="currentText" id="nuChatText" rows="1"></textarea>
            <b-button @click="sendMessage()" class="col-sm-4" size="sm" variant="primary">
              Send
            </b-button>
          </b-row>
        </b-form>
      </b-card>
    </b-card-group>
    <Modal ref="modal" />
  </b-row>
</template>

<script>
import axios from 'axios';
import Vue from 'vue';
import Modal from './modal/Modal.vue';

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
  max-height: 600px;
  overflow-y: auto;

  #nuChatText {
    resize: vertical;
    border-radius: 10px;
  }
  .list-group-item.nuTextBubble {
    margin-bottom: 10px;
    border-radius: 10px;
    border: none;
  }
  .card-body {
    background-color: #eee;
  }
}
</style>
