<template>
  <b-row id='nuChatArea'>
    <b-card-group deck class='w-100'>
      <b-card :header="'Live Chat: ' + this.partner.username">
      <b-card-text>

        <b-list-group-item variant='dark' class='nuTextBubble'>
          <div>
            <div>Howdy!</div>
            <b-badge pill variant='light' class='mr-1'>{{ this.partner.username }}</b-badge>
          </div>
        </b-list-group-item>

        <b-list-group-item
          variant='light'
          class='nuTextBubble text-align-right d-flex justify-content-end'>
          <div>
            <p class='text-right'>hi!</p>
            <b-badge pill variant='secondary' class='mr-1'>me @ 02/22/2021</b-badge>
          </div>
        </b-list-group-item>

      </b-card-text>
        <b-form class='container-fluid'>
          <b-row>
            <textarea
              class='col-sm-8'
              v-model='currentText'
              id="nuChatText"
              rows="1">
            </textarea>
            <b-button
              class='col-sm-4'
              size='sm'
              variant='primary'>Send</b-button>
          </b-row>
        </b-form>
      </b-card>

    </b-card-group>
  </b-row>
</template>

<script>
export default {
  name: 'ChatBox',
  props: {
    selectedPartner: Object,
  },
  data() {
    return {
      userID: this.$store.state.userID,
      partner: this.selectedPartner,
      currentText: null,
      chatLog: {},
    };
  },
  created() {
    this.partner = this.selectedPartner;
  },
};
</script>
<style lang='scss'>
#nuChatArea {
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
