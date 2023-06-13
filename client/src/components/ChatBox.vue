<template>
  <b-card no-body no-header>
    <b-card-header flush>
      Live Chat: {{ this.partner.username }}
      <b-link id="closeChat" variant="danger" @click="closeChat()" size="md" class="ml-auto">
        <b-icon class="nuRemoveFriendIcon" variant="danger" icon="x-circle" scale="1.2"> </b-icon>
      </b-link>
    </b-card-header>

    <b-card-body>
      <b-list-group>
        <div
          :class="isMine(msg.userID) ? 'nuTextBubble nuMine' : 'nuTextBubble nuNotMine col-sm-12'"
          v-for="msg in this.chatLog"
          :key="msg._id"
        >
          <p
            class="card-text mr-2"
            :class="isMine(msg.userID) ? 'bg-light text-primary' : 'bg-dark text-light'"
          >
            {{ msg.message }}
          </p>

          <div class="nuBadgeWrap">
            <b-badge
              pill
              :variant="isMine(msg.userID) ? 'secondary' : 'info'"
              class="mr-1 userBadge"
            >
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
        <b-row class="d-flex flex-column">
          <textarea
            class="mb-2"
            ref="chatTextArea"
            v-model="currentText"
            id="nuChatText"
            rows="2"
            max-rows="8"
            @keydown.enter.exact.prevent="sendMessage()"
            @input="resizeTextArea()"
          ></textarea>
          <b-button
            @click="sendMessage()"
            class="col-sm-4 align-self-end"
            size="sm"
            variant="primary"
          >
            Send
          </b-button>
        </b-row>
      </b-form>
    </b-card-footer>
    <Modal ref="modal" />
  </b-card>
</template>

<script>
import axios from "axios";
import Vue from "vue";
import Modal from "./modal/Modal.vue";
import Bus from "../main";

export default {
  name: "ChatBox",
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
      currentText: "",
      chatLog: {},
    };
  },
  mounted() {
    this.partner = this.selectedPartner;
    this.chatID = this.partner.chatID; // eslint-disable-line prefer-destructuring
    this.resizeTextArea();
    this.$refs.chatTextArea.focus();

    axios
      .get("/api/messages", {
        params: { userID: this.userID, friendID: this.partner._id, channel: 0 },
      })
      .then((res) => {
        res.data.forEach((msg) => {
          Vue.set(this.chatLog, msg._id, msg);
        });
      })
      .catch((error) => {
        this.$refs.modal.show([{ body: error.message }, { body: error.response.data.message }]);
      });

    this.sockets.subscribe(`chat-update:${this.chatID}`, (messages) => {
      this.chatLog = messages;
    });
  },
  methods: {
    resizeTextArea(reset = false) {
      let areaHeight = this.$refs.chatTextArea.scrollHeight,
        currentHeight = this.$refs.chatTextArea.style.height;

      if (reset) {
        this.$refs.chatTextArea.style.height = "52px";
      } else if (areaHeight < 125 && areaHeight > currentHeight.split("px")[0]) {
        this.$refs.chatTextArea.style.height = `${areaHeight}px`;
      }
    },
    isMine(id) {
      return this.userID === id;
    },
    closeChat() {
      Bus.$emit("toggleChat", this.partner);
    },
    sendMessage() {
      if (!this.currentText.length) {
        this.$refs.modal.show([{ body: "You must input a message body before submitting" }], true);
      } else {
        const data = {
          userID: this.userID,
          friendID: this.partner._id,
          channel: 0,
          message: this.currentText,
        };
        axios
          .post("/api/messages", data)
          .then((res) => {
            const msg = res.data;
            Vue.set(this.chatLog, msg._id, msg);
          })
          .catch((error) => {
            this.$refs.modal.show([{ body: error.message }, { body: error.response.data.message }]);
          });
      }
      this.currentText = "";
      this.resizeTextArea(true);
    },
  },
};
</script>
