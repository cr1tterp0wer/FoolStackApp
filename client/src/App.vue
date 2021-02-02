<template>
  <div id='app'>
    <Menu/>
    <div id='content'>
      <router-view/>
    </div>
  </div>
</template>

<script>
import Menu from './components/menu/Menu.vue';

export default {
  components: {
    Menu,
  },
};
</script>

<style lang='scss'>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  background: rgb(59, 59, 206);
}
</style>
