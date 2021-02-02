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
                placeholder="Email"
                required
              ></b-form-input>
            </b-form-group>

            <b-form-group id="nuInputEmailGroup">
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
            <a href="#" class="fsLinkCreateAccount">Create An Account</a>
          </b-col>
          <b-col class="my-3">
            <a href="#" class="fsLinkForgotPassword my-3">Forgot Password?</a>
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
        this.$refs.modal.show([{ body: 'Sucessfully Logged in' }], false);
        this.$session.set('nu_social_t', res.data.token);
      }).catch((error) => {
        this.$refs.modal.show([
          { body: error.message },
          { body: error.response.data.message },
        ]);
      });
    },
    validateInput(inputs) {
      const validation = {
        errors: [],
        inputs,
      };

      if (!inputs.email) {
        validation.errors.push({ body: 'Email: is not set!' });
      } else if (!RegExp(/^([a-zA-Z0-9]|-)*@([a-zA-Z0-9])*\.[a-z]*/).test(inputs.email)) {
        validation.errors.push({ body: 'Email: is not valid!' });
      }
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
