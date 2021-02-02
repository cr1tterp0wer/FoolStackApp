<template>
  <b-modal ref='popup' id="modal" :title="title">

    <ul>
      <li v-for="message in messages" :key="message.body">
        <b-alert show variant="danger" v-if="error">{{message.body}}</b-alert>
        <b-alert show variant="success" v-show="!error">{{message.body}}</b-alert>
      </li>
    </ul>

  </b-modal>
</template>

<script>
export default {
  name: 'Modal',
  data() {
    return {
      messages: [],
      body: '',
      error: false,
    };
  },
  computed: {
    title() { return this.error ? 'Error' : 'Success'; },
  },
  methods: {
    show(messages, error = true) {
      this.messages = messages;
      this.error = error;
      this.$refs.popup.show();
    },
  },
};
</script>
