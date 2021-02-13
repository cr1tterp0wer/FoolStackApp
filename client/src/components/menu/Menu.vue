<template>
  <div>
    <b-navbar fixed="top" toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand href="#">NuSocial</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item v-if='this.$store.state.isLogged' href="/">Home</b-nav-item>
          <b-nav-item v-if='!this.$store.state.isLogged' href="/login">Login</b-nav-item>
          <b-nav-item v-if='this.$store.state.isLogged' v-on:click='logout()'>Logout</b-nav-item>
          <b-nav-item v-if='!this.$store.state.isLogged' href="/signup">Signup</b-nav-item>
        </b-navbar-nav>

      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Menu',
  methods: {
    logout() {
      axios.delete('/api/sessions').then(() => {
        this.$store.dispatch('clearAuth');
        this.$router.push('/login');
      }).catch((error) => {
        throw (error);
      });
    },
  },
};
</script>
