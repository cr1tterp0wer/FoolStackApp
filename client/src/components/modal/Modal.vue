<template>
  <b-modal ref='popup' id="modal" :title="title" @hide="handleHide">

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
const OK_EVENT = 'ok';
const CANCEL_EVENT = 'cancel';

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
    /* eslint-disable camelcase, no-extra-boolean-cast */
    show(messages, error = true, cb_hide) {
      this.messages = messages;
      this.error = error;
      this.$refs.popup.show();

      if (!!cb_hide) this.$root.$once(HIDE_EVENT, () => { cb_hide(); });
    },
    /* eslint-enable camelcase */

    handleHide(event) {
      if (event.trigger === OK_EVENT) {
        this.$emit(OK_EVENT);
      } else if (event.trigger === CANCEL_EVENT) {
        this.$emit(CANCEL_EVENT);
      }
    },
  },
};
</script>
