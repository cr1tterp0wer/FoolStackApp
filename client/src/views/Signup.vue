<template>
  <div id='nuLogin' class="vh-100 w-100">
    <b-container class="h-100" align-v='center'>
        <b-row class="nuLoginColumn pt-5 h-100" align-h="center" cols='4'>

          <b-form @submit="onSubmit" class="text-left w-100">
            <b-row cols='2'>

              <b-col cols='6'>
                <b-form-group id="nuInputFnameGroup" >
                  <b-form-input id="nuInputFname" required
                    v-model="form.firstname"
                    placeholder="First Name"
                  ></b-form-input>
                </b-form-group>
              </b-col>

              <b-col cols='6'>
                <b-form-group id="nuInputLnameGroup">
                  <b-form-input id="nuInputLname" required
                    v-model="form.lastname"
                    placeholder="Last Name"
                  ></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>

            <b-form-group id="nuInputEmailGroup">
              <b-form-input id="nuInputEmail" required
                v-model="form.email"
                type="email"
                placeholder="National Univeristy Email"
              ></b-form-input>
            </b-form-group>

            <b-form-group id="nuInputUsernameGroup">
              <b-form-input id="nuInputUsername" required
                v-model="form.username"
                placeholder="Username"
              ></b-form-input>
            </b-form-group>

            <b-form-group id="nuInputPasswordGroup">
              <b-form-input id="nuInputPassword" required
                v-model="form.password"
                type="password"
                placeholder="Password"
              ></b-form-input>
            </b-form-group>

            <b-form-group id="nuInputPasswordVerfiyGroup">
              <b-form-input id="nuInputPasswordVerfiy" required
                v-model="form.passwordVerify"
                type="password"
                placeholder="Verify Password"
              ></b-form-input>
            </b-form-group>

            <b-button type="submit" variant="primary" class="w-100">Create Account</b-button>
          </b-form>
        </b-row>

        <Modal ref='modal'/>
    </b-container>
  </div>
</template>

<script>
import axios from 'axios';
import Modal from '../components/modal/Modal.vue';

export default {
  data() {
    return {
      form: {
        email: '',
        password: '',
        passwordVerify: '',
        username: '',
        firstname: '',
        lastname: '',
      },
    };
  },
  components: {
    Modal,
  },
  methods: {
    onSubmit(event) {
      event.preventDefault();
      const validation = this.validateInput(this.form);
      if (validation.errors.length) {
        this.$refs.modal.show(validation.errors);
      } else {
        this.createAccount();
      }
    },
    createAccount() {
      axios.post('/api/users', {
        email: this.form.email,
        firstname: this.form.firstname,
        lastname: this.form.lastname,
        password: this.form.password,
        username: this.form.username,
      }).then(() => {
        this.$refs.modal.show([
          { body: 'Sucessfully created account' },
          { body: 'Please check your email for verification!' },
        ], false,
        () => {
          this.$store.dispatch('clearAuth');
          this.$router.push('/login');
        });
        this.resetForm();
      }).catch((error) => {
        this.$refs.modal.show([
          { body: error.message },
          { body: error.response.data.message },
        ]);
      });
    },
    resetForm() {
      this.form = {
        email: '',
        password: '',
        passwordVerify: '',
        username: '',
        firstname: '',
        lastname: '',
      };
    },
    validateInput(inputs) {
      const validation = {
        errors: [],
        inputs,
      };

      if (!inputs.firstname) {
        validation.errors.push({ body: 'First Name: is not set!' });
      }

      if (!inputs.lastname) {
        validation.errors.push({ body: 'Last Name: is not set!' });
      }

      if (!inputs.email) {
        validation.errors.push({ body: 'Email: is not set!' });
      } else if (!RegExp(/^([a-zA-Z0-9]|-|.|_|)*@([a-zA-Z0-9])*.nu.edu$/).test(inputs.email)) {
        validation.errors.push({ body: 'Email: is not valid!' });
        validation.errors.push({ body: 'Email: Must be a valid National Univsity Email (@student.nu.edu)' });
      }

      if (!inputs.password) {
        validation.errors.push({ body: 'Password: is not set!' });
      } else if (inputs.password.length < 6) {
        validation.errors.push({ body: 'Password: must be at least 6 characters long!' });
      }

      if (!inputs.passwordVerify) {
        validation.errors.push({ body: 'Password Verification: is not set!' });
      } else if (inputs.passwordVerify.length < 6) {
        validation.errors.push({ body: 'Password Verification: must be at least 6 characters long!' });
      } else if (inputs.passwordVerify !== inputs.password) {
        validation.errors.push({ body: 'Password Verification: Does not match!' });
      }
      return validation;
    },
  },
};
</script>

<style lang="scss" scoped>
#nuLogin {
  background: #eee;
}
.nuLoginColumn {
  display: flex;
  align-items: center;
  background: white;
}
a {
  text-decoration: none;
  font-weight: bold;
}
.fsLinkLogin {
  font-size: 1.5rem;
}
</style>
