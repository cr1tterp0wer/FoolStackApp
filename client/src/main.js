import Vue from 'vue';
import VueSession from 'vue-session';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import axios from 'axios';
import App from './App.vue';
import store from './store';
import router from './router';
import '../custom.scss';

const serverURL = process.env.VUE_APP_SERVER_URL;

if (serverURL) axios.defaults.baseURL = serverURL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);
// Use Session Storage
Vue.use(VueSession);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
