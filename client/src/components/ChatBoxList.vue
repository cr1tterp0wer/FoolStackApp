<template>
  <b-row id="nuChatArea" class='mr-3'>
    <b-card-group deck class="w-100">
      <ChatBox
        v-for="partner in this.partners"
        :selectedPartner='partner'
        :key="partner._id">
      </ChatBox>
    </b-card-group>
    <Modal ref="modal" />
  </b-row>
</template>
<script>
import Vue from 'vue';
import Modal from './modal/Modal.vue';
import ChatBox from './ChatBox.vue';
import Bus from '../main';

export default {
  name: 'ChatBoxList',
  components: {
    Modal,
    ChatBox,
  },
  data() {
    return {
      partners: {},
      user: this.$store.state.user,
      userID: this.$store.state.userID,
    };
  },
  created() {
    Bus.$on('toggleChat', this.toggleChatBox);
  },
  methods: {
    toggleChatBox(friend) {
      if (Object.keys(this.partners).includes(friend._id)) {
        Vue.delete(this.partners, friend._id);
      } else {
        Vue.set(this.partners, friend._id, friend);
      }
    },
  },
};
</script>
