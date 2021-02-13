<template>
  <b-modal ref='popup' id="modal" :title="title">

    <ul>
      <li v-for="(message, index) in messages" :key="index">
        <b-alert show variant="danger" v-if="error">{{message.body}}</b-alert>
        <b-alert show variant="success" v-show="!error">{{message.body}}</b-alert>
      </li>
    </ul>

  </b-modal>
</template>

<script>
const HIDE_EVENT = 'bv::modal::hide';

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
    show(messages, error = true, cb) {
      this.messages = messages;
      this.error = error;
      this.$refs.popup.show();

      if (cb) this.$root.$once(HIDE_EVENT, () => { cb(); });
    },
  },
};
</script>
