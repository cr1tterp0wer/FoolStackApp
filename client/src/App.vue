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
