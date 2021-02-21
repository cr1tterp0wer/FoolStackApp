<template>
  <div id='nuLogin' class='vh-100 w-100'>
    <b-container class='h-100'>
      <b-row class='h-100 nuLoginColumn' align-v='center'>
        <b-col sm='4' class='mx-auto'>
          <b-form @submit='onSubmit' class='text-left'>
            <b-form-group id='nuInputEmailGroup'>
              <b-form-input
                id='nuInputEmail'
                v-model='form.email'
                placeholder='National University Email'
                required
              ></b-form-input>
            </b-form-group>

            <b-form-group id='nuInputPasswordGroup'>
              <b-form-input
                id='nuInputPassword'
                type='password'
                v-model='form.password'
                placeholder='Password'
                required
              ></b-form-input>
            </b-form-group>

            <b-button type='submit' variant='primary' class='w-100'>Log In</b-button>
          </b-form>

         <hr>
          <b-col class='my-3 text-center'>
            <router-link to='/signup' class='fsLinkCreateAccount text-success font-weight-bold'
              >Create An Account</router-link>
          </b-col>
          <b-col class='my-3 text-center '>
            <a href='#' class='my-3 text-info font-weight-bold' v-b-toggle.nuForgotPasswordArea>
              Forgot Password?
            </a>
            <b-collapse id='nuForgotPasswordArea'>
              <b-form @submit='onForgotPassword' class='text-left'>
                <b-form-input
                  id='nuInputEmailValidation'
                  type='email'
                  v-model='form.emailValidationForgotPassword'
                  placeholder='National University Email'
                  required
                ></b-form-input>
                <b-button type='submit' variant='primary' class='w-100'>
                  Send Password Reset Link
                </b-button>
              </b-form>
            </b-collapse>
          </b-col>

          <b-col class='my-3 text-center'>
            <a class=' text-info font-weight-bold' v-b-toggle.nuValidateArea>
              Resend Email Validation?
            </a>
            <b-collapse id='nuValidateArea'>
              <b-form @submit='onEmailValidation' class='text-left'>
                <b-form-input
                  id='nuInputEmailValidation'
                  type='email'
                  v-model='form.emailValidation'
                  placeholder='National University Email'
                  required
                ></b-form-input>
                <b-button type='submit' variant='primary' class='w-100'>
                  Send Email Validation
                </b-button>
              </b-form>
            </b-collapse>
          </b-col>
        </b-col>
      </b-row>
      <Modal ref='modal' />
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
        emailValidationForgotPassword: '',
      },
    };
  },

  components: {
    Modal,
  },

  methods: {
    /**
     * Form onSubmit handler
     * @param {Object} event - event listener
     */
    onSubmit(event) {
      event.preventDefault();
      const validation = this.validateInput(this.form);
      if (validation.errors.length) {
        this.$refs.modal.show(validation.errors);
      } else {
        this.login();
      }
    },

    /**
     * Logs the User into the app
     */
    login() {
      axios
        .post('/api/sessions', {
          email: this.form.email,
          password: this.form.password,
        })
        .then((res) => {
          this.$store.dispatch('setAuth', {
            user: res.data.user,
            token: res.data.token,
          });
          this.$router.push('/');
        })
        .catch((error) => {
          this.$refs.modal.show([{ body: error.message }, { body: error.response.data.message }]);
        });
    },

    /**
     * Generates a validation email
     */
    sendEmailValidation() {
      axios
        .post('/api/users/validate', {
          email: this.form.emailValidation,
        })
        .then(() => {
          this.$refs.modal.show(
            [{ body: 'Success' }, { body: 'Check your email for a validation link!' }],
            false,
          );
        })
        .catch((error) => {
          this.$refs.modal.show([{ body: error.message }, { body: error.response.data.message }]);
        });
    },

    /**
     * Generates a password reset email
     */
    sendPasswordReset() {
      axios
        .post('/api/users/reset-password', {
          email: this.form.emailValidationForgotPassword,
        })
        .then(() => {
          this.$refs.modal.show(
            [{ body: 'Success' }, { body: 'Check your email for a validation link!' }],
            false,
          );
        })
        .catch((error) => {
          this.$refs.modal.show([{ body: error.message }, { body: error.response.data.message }]);
        });
    },

    /**
     * Catches errors and handles them with modal
     */
    onEmailValidation(event) {
      event.preventDefault();
      const errors = this.validateInputEmail(this.form.emailValidation);

      if (errors.length) {
        this.$refs.modal.show(errors);
      } else {
        this.sendEmailValidation();
      }
    },

    /**
     * Validates email input form submission
     */
    onForgotPassword(event) {
      event.preventDefault();
      const errors = this.validateInputEmail(this.form.emailValidationForgotPassword);

      if (errors.length) {
        this.$refs.modal.show(errors);
      } else {
        this.sendPasswordReset();
      }
    },

    /**
     * Validates email input form submission
     */
    validateInputEmail(email) {
      const errors = [];

      if (!email) {
        errors.push({ body: 'Email: is not set!' });
      } else if (!RegExp(/^([a-zA-Z0-9]|-|.|_|)*@([a-zA-Z0-9])*((.nu.edu)|(natuniv.edu))$/).test(email)) {
        errors.push({ body: 'Email: is not valid!' });
        errors.push({ body: 'Email: Must be a valid National Univsity Email (@nu.edu, @natuniv.edu)' });
      }

      return errors;
    },

    /**
     * Validates {email|password} inputs form submission
     */
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

<style lang='scss' scoped></style>
