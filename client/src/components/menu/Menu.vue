<template>
  <div>
    <b-navbar type="dark" variant="primary" class="navbar-expand-lg">
      <b-navbar-brand id="menu-icon" href="/"><img src="/baku-round.png" /></b-navbar-brand>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item v-if="this.$store.state.isLogged" to="/Home">Home</b-nav-item>
          <b-nav-item v-if="!this.$store.state.isLogged" to="/Login">Login</b-nav-item>
          <b-nav-item v-if="this.$store.state.isLogged" v-on:click="logout()">Logout</b-nav-item>
          <b-nav-item v-if="!this.$store.state.isLogged" to="/SignUp">Signup</b-nav-item>
          <b-nav-item to="/AboutUs">About us</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto" v-if="this.$store.state.isLogged" is-nav>
          <b-nav-item v-b-toggle.userSettingsSidebar>
            <b-icon icon="gear-fill"></b-icon>
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <UserSettingsMenu v-if="this.$store.state.isLogged" />
  </div>
</template>

<script>
import axios from "axios";
import UserSettingsMenu from "./UserSettingsMenu.vue";

export default {
  name: "Menu",
  components: {
    UserSettingsMenu,
  },
  methods: {
    logout() {
      axios
        .delete("/api/sessions")
        .then(() => {
          this.$store.dispatch("clearAuth");
          this.$router.push("/login");
        })
        .catch((error) => {
          throw error;
        });
    },
  },
};
</script>
