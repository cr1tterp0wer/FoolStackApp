<template>
  <div id='nuNotFound' class='d-flex align-items-center justify-content-center'>
    <div class=''>
      <h1>Oops.</h1>
      <h2>The page you're looking for doesn't exist.</h2>
      <p>Go back to NU Social.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageNotFound',
};
</script>

<style lang="scss">
  .navbar {
    display: none;
  }
  #content {
    height:100vh;
    width: 100%;
    background-image: linear-gradient(#5371d3, #00d0ff);
  }
  #nuNotFound {
    width: 100%;
    height: 100%;
    color: white;

    h1 {
      font-size: 20rem;
    }
  }
</style>
