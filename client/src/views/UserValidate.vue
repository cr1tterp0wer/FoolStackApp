<template>
  <div id='nuPasswordReset' class='d-flex align-items-center justify-content-center'>
    <b-form @submit='validateUser'>

    <h5>Validate User</h5>
      <b-row>
        <b-button type='submit' variant='dark' class='w-100'>Validate User</b-button>
      </b-row>
    </b-form>
    <Modal ref='validateUser' />
  </div>
</template>

<script>
import axios from 'axios';
import Modal from '../components/modal/Modal.vue';

export default {
  name: 'UserValidate',
  components: {
    Modal,
  },

  data() {
    return {
      vhs: null,
      userID: null,
      updatedAt: null,
    };
  },

  created() {
    const uri = window.location.search.substring(1);
    const params = new URLSearchParams(uri);

    this.$store.dispatch('clearAuth');
    this.vhs = params.get('vhs');
    this.userID = params.get('userID');
    this.updatedAt = new Date();
  },

  methods: {
    /**
     * Form onSubmit validateUser
     * Validates the user given the id and hash
     * @param {Object} event - event listener
     */
    validateUser(event) {
      event.preventDefault();

      const data = {
        userID: this.userID,
        vhs: this.vhs,
        updatedAt: this.updatedAt,
      };
      axios
        .patch('api/users', data)
        .then(() => {
          this.$refs.validateUser.show(
            [
              { body: 'Successfully Validated Your account!' },
              { body: 'Try logging in to view the Post Feed!' },
            ],
            false,
            () => {
              this.$store.dispatch('clearAuth');
              this.$router.push('/login');
            },
          );
        })
        .catch((error) => {
          this.$refs.validateUser.show([
            { body: error.message },
            { body: error.response.data.message },
          ]);
        });
    },
  },
};
</script>

<style lang='scss'>
input {
  transition: 250ms;
}
#nuPasswordReset {
  height: 100vh;
}
</style>
