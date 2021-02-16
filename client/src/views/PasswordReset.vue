<template>
  <div id='nuPasswordReset' class='d-flex align-items-center justify-content-center'>
    <b-form @submit='submitPassword'>

    <h5>Reset Password</h5>
      <b-row>
        <b-form-group id='nuInputPasswordGroup' class='col-md-12'>
          <b-form-input
            id='nuInputPassword'
            required
            class='nuUserSettingsInput'
            v-model='password'
            type='password'
            placeholder='Password'
          ></b-form-input>
        </b-form-group>
      </b-row>

      <b-row>
        <b-form-group id='nuInputPasswordVerfiyGroup' class='col-md-12'>
          <b-form-input
            id='nuInputPasswordVerfiy'
            required
            class='nuUserSettingsInput'
            v-model='passwordVerify'
            type='password'
            placeholder='Verify Password'
          ></b-form-input>
        </b-form-group>
        <b-button type='submit' variant='dark' class='w-100'>Submit</b-button>
      </b-row>
    </b-form>
    <Modal ref='passwordReset' />
  </div>
</template>

<script>
import axios from 'axios';
import Modal from '../components/modal/Modal.vue';

export default {
  name: 'PasswordReset',
  components: {
    Modal,
  },

  data() {
    return {
      password: '',
      passwordVerify: '',
      vhs: null,
      userID: null,
    };
  },

  created() {
    const uri = window.location.search.substring(1);
    const params = new URLSearchParams(uri);

    this.$store.dispatch('clearAuth');
    this.vhs = params.get('vhs');
    this.userID = params.get('userID');
  },

  methods: {
    /**
     * Form onSubmit Password
     * Resets the Password of the user
     * @param {Object} event - event listener
     */
    submitPassword(event) {
      event.preventDefault();
      let errors = []; // eslint-disable-line prefer-const

      if (!this.password) {
        errors.push({ body: 'Password: is not set!' });
      } else if (this.password.length < 6) {
        errors.push({ body: 'Password: must be at least 6 characters long!' });
      }

      if (!this.passwordVerify) {
        errors.push({ body: 'Password Verification: is not set!' });
      } else if (this.passwordVerify.length < 6) {
        errors.push({ body: 'Password Verification: must be at least 6 characters long!' });
      } else if (this.passwordVerify !== this.password) {
        errors.push({ body: 'Password Verification: Does not match!' });
      }

      if (errors.length) this.$refs.passwordReset.show(errors);
      else {
        const data = {
          userID: this.userID,
          password: this.password,
          passwordVerify: this.passwordVerify,
          vhs: this.vhs,
        };
        axios
          .patch('api/users', data)
          .then(() => {
            this.$refs.passwordReset.show(
              [
                { body: 'Successfully updated Password!' },
                { body: 'Try not to forget it this time!' },
              ],
              false,
              () => {
                this.$store.dispatch('clearAuth');
                this.$router.push('/login');
              },
            );
          })
          .catch((error) => {
            this.$refs.passwordReset.show([
              { body: error.message },
              { body: error.response.data.message },
            ]);
          });
      }
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
