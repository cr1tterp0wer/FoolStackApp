<template>
  <div>
    <b-sidebar
     bg-variant='light'
     backdrop
     shadow
     id='userSettingsSidebar'
     title='User Settings'
    >
      <div class='px-3 py-2 d-flex align-items-center'>
        <section>
          <b-form @submit='submitFName'>
            <b-form-group
              id='nuInputFnameGroup'
              label-for='nuInputFname'
              label='First Name'
              label-cols-sm='4'
            >
              <b-form-input
                id='nuInputFname'
                required
                class='nuUserSettingsInput'
                v-model='firstname'
              ></b-form-input>
              <b-button variant='dark' type='submit' class='w-100'>Submit</b-button>
            </b-form-group>
          </b-form>

          <hr />

          <b-form @submit='submitLName'>
            <b-form-group
              id='nuInputLnameGroup'
              label-for='nuInputLname'
              label='Last Name'
              label-cols-sm='4'
            >
              <b-form-input
                id='nuInputLname'
                required
                class='nuUserSettingsInput'
                v-model='lastname'
              ></b-form-input>
              <b-button variant='dark' type='submit' class='w-100'>Submit</b-button>
            </b-form-group>
          </b-form>

          <hr />
          <section>
            <p class='nuUserSettingsLabel'>Password Reset</p>

            <b-form @submit='submitPassword'>
              <b-form-group id='nuInputPasswordGroup'>
                <b-form-input
                  id='nuInputPassword'
                  required
                  class='nuUserSettingsInput'
                  v-model='password'
                  type='password'
                  placeholder='Password'
                ></b-form-input>
              </b-form-group>

              <b-form-group id='nuInputPasswordVerfiyGroup'>
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
            </b-form>
          </section>

          <hr>
          <b-form @submit='deleteAccount'>
            <b-button type='submit' variant='danger' class='w-100'>DELETE ACCOUNT</b-button>
          </b-form>
        </section>
      </div>
    </b-sidebar>

    <Modal ref='userModal' />
  </div>
</template>

<script>
import axios from 'axios';
import Modal from '../modal/Modal.vue';

export default {
  name: 'UserSettingsMenu',
  components: {
    Modal,
  },
  data() {
    return {
      userID: this.$store.state.userID,
      password: '',
      passwordVerify: '',
      firstname: JSON.parse(this.$store.state.user).firstname,
      lastname: JSON.parse(this.$store.state.user).lastname,
    };
  },

  methods: {

    /**
     * Form onSubmit First Name
     * Resets the First Name of the user
     * @param {Object} event - event listener
     */
    submitFName(event) {
      event.preventDefault();

      if (!this.firstname) {
        this.$refs.userModal.show([{ body: 'First Name: is not set!' }]);
      } else {
        axios
          .patch('api/users', {
            userID: this.userID,
            firstname: this.firstname,
          })
          .then((res) => {
            this.$refs.userModal.show(
              [{ body: `Successfully updated First Name: ${res.data.firstname}` }],
              false,
            );
            this.$store.dispatch('setUserData', res.data);
          })
          .catch((error) => {
            this.$refs.userModal.show([
              { body: error.message },
              { body: error.response.data.message },
            ]);
          });
      }
    },

    /**
     * Form onSubmit Last Name
     * Resets the Last Name of the user
     * @param {Object} event - event listener
     */
    submitLName(event) {
      event.preventDefault();

      if (!this.lastname) {
        this.$refs.userModal.show([{ body: 'Last Name: is not set!' }]);
      } else {
        axios
          .patch('api/users', {
            userID: this.userID,
            lastname: this.lastname,
          })
          .then((res) => {
            this.$refs.userModal.show(
              [{ body: `Successfully updated Last Name: ${res.data.lastname}` }],
              false,
            );
            this.$store.dispatch('setUserData', res.data);
          })
          .catch((error) => {
            this.$refs.userModal.show([
              { body: error.message },
              { body: error.response.data.message },
            ]);
          });
      }
    },

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

      if (errors.length) this.$refs.userModal.show(errors);
      else {
        axios
          .patch('api/users', {
            userID: this.userID,
            password: this.password,
            passwordVerify: this.passwordVerify,
          })
          .then((res) => {
            this.$store.dispatch('setUserData', res.data);
            this.$refs.userModal.show(
              [
                { body: 'Successfully updated Password!' },
                { body: 'try not to forget it this time!' },
              ],
              false,
              () => {
                this.$store.dispatch('clearAuth');
                this.$router.go(0);
              },
            );
          })
          .catch((error) => {
            this.$refs.userModal.show([
              { body: error.message },
              { body: error.response.data.message },
            ]);
          });
      }
    },

    /**
     * Prevalidation Popup Modal for
     * Deleting the User Account
     */
    deleteAccount(event) {
      event.preventDefault();

      this.$refs.userModal.$once('ok', this.destroyUser);

      this.$refs.userModal.show(
        [{ body: 'ARE YOU SURE YOU WISH TO DELETE YOUR ACCOUNT?' }, { body: 'THIS ACTION CANNOT BE UNDONE' }],
        true,
      );
    },

    /**
     * Form onSubmit Delete Account
     * Deletes the User Account
     * @param {Object} event - event listener
     */
    destroyUser() {
      axios.delete('/api/users', { data: { userID: this.userID } }).then(() => {
        this.$store.dispatch('clearAuth');
        this.$router.go(0);
      }).catch((error) => {
        this.$refs.userModal.show([
          { body: error.message },
          { body: error.response.data.message },
        ]);
      });
    },
  },
};
</script>

<style lang='scss'>
.b-sidebar-header {
  margin-top: 1rem;
}
</style>
