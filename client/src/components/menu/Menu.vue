<template>
  <div>
    <b-navbar fixed="top" toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand href="#">NuSocial</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="/">Home</b-nav-item>
          <b-nav-item href="/login">Login</b-nav-item>
          <b-nav-item href="/signup">Signup</b-nav-item>
        </b-navbar-nav>

      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
export default {
  name: 'Menu',
};
</script>
