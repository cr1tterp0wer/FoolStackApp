<template>
  <div>
    <b-navbar fixed="top" toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand href="#">NuSocial</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="/">Home</b-nav-item>
          <b-nav-item href="/login">Login</b-nav-item>
          <b-nav-item v-on:click='logout()'>Logout</b-nav-item>
          <b-nav-item href="/signup">Signup</b-nav-item>
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
      const config = {
        headers: {
          Authorization: this.$session.get('nu_social_t'),
        },
      };

      axios.delete('/api/auth/delete', config).then(() => {
        this.$session.remove('nu_social_t');
        this.$session.remove('nu_uid');
        this.$router.push('/login');
      }).catch((error) => {
        throw (error);
      });
    },
  },
};
</script>
