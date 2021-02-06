<template>
  <div id='nuLogin' class="vh-100 w-100">
    <b-container class="h-100">
      <b-row class="h-100 nuLoginColumn" align-v="center">
        <b-col sm="4" class="mx-auto">
          <b-form @submit="onSubmit" class="text-left">
            <b-form-group id="nuInputEmailGroup">
              <b-form-input
                id="nuInputEmail"
                v-model="form.email"
                placeholder="National University Email"
                required
              ></b-form-input>
            </b-form-group>

            <b-form-group id="nuInputPasswordGroup">
              <b-form-input
                id="nuInputPassword"
                type="password"
                v-model="form.password"
                placeholder="Password"
                required
              ></b-form-input>
            </b-form-group>

            <b-button type="submit" variant="primary" class="w-100">Log In</b-button>
          </b-form>

          <b-col class="my-3">
            <router-link to="/signup" class="fsLinkCreateAccount">Create An Account</router-link>
          </b-col>
          <b-col class="my-3">
            <a href="#" class="fsLinkForgotPassword my-3">Forgot Password?</a>
          </b-col>
          <b-col class="my-3">
            <b-button
              href="#"
              class="fsLinkForgotPassword my-3"
              v-b-toggle.nuValidateArea>
              Resend Email Validation?
            </b-button>
            <b-collapse id="nuValidateArea">
              <b-form @submit="onEmailValidation" class="text-left" >
                <b-form-input
                  id="nuInputEmailValidation"
                  type="email"
                  v-model="form.emailValidation"
                  placeholder="National University Email"
                  required
                ></b-form-input>
                <b-button
                  type="submit"
                  variant="primary"
                  class="w-100">
                  Send Email Validation
                </b-button>
              </b-form>
            </b-collapse>
          </b-col>
        </b-col>
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
        showValidate: false,
        emailValidation: '',
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
        this.login();
      }
    },

    login() {
      axios.post('/api/auth/new', {
        email: this.form.email,
        password: this.form.password,
      }).then((res) => {
        this.$session.set('nu_social_t', res.data.token);
        this.$session.set('nu_uid', res.data.user.id);
        this.$store.state.user = res.data.user;
        this.$router.push('/');
      }).catch((error) => {
        this.$refs.modal.show([
          { body: error.message },
          { body: error.response.data.message },
        ]);
      });
    },

    sendEmailValidation() {
      axios.post('/api/users/revalidate', {
        email: this.form.emailValidation,
      }).then(() => {
        this.$refs.modal.show([
          { body: 'Success' },
          { body: 'Check your email for a validation link!' },
        ], false);
      }).catch((error) => {
        this.$refs.modal.show([
          { body: error.message },
          { body: error.response.data.message },
        ]);
      });
    },

    onEmailValidation(event) {
      event.preventDefault();
      const errors = this.validateInputEmail(this.form.emailValidation);

      if (errors.length) {
        this.$refs.modal.show(errors);
      } else {
        this.sendEmailValidation();
      }
    },

    validateInputEmail(email) {
      const errors = [];

      if (!email) {
        errors.push({ body: 'Email: is not set!' });
      } else if (!RegExp(/^([a-zA-Z0-9]|-|.|_|)*@([a-zA-Z0-9])*.nu.edu/).test(email)) {
        errors.push({ body: 'Email: is not valid!' });
        errors.push({ body: 'Email: Must be a valid National Univsity Email (@student.nu.edu)' });
      }

      return errors;
    },

    validateInput(inputs) {
      const validation = {
        errors: [],
        inputs,
      };

      const emailErrors = this.validateInputEmail(inputs.email);
      if (emailErrors.length) validation.errors.push(emailErrors);

      if (!inputs.password) {
        validation.errors.push({ body: 'Password: is not set!' });
      } else if (inputs.password.length < 6) {
        validation.errors.push({ body: 'Password: must be at least 6 characters long!' });
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
  background: white;
}
a {
  text-decoration: none;
  font-weight: bold;
}
.fsLinkCreateAccount {
  font-size: 1.5rem;
}
</style>
