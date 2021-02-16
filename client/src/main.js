import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import axios from 'axios';
import App from './App.vue';
import store from './store';
import router from './router';
import '../custom.scss';
import 'bootswatch/dist/slate/bootstrap.min.css';

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.config.productionTip = false;
Vue.prototype.$axios = axios;

const serverURL = process.env.VUE_APP_SERVER_URL;
if (serverURL) axios.defaults.baseURL = serverURL;

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.interceptors.request.use((req) => {
  req.headers.authorization = store.state.token || ''; // eslint-disable-line no-param-reassign
  return req;
});

axios.interceptors.response.use((res) => {
  store.dispatch('refreshIsLogged');
  return res;
}, (error) => {
  if (error.response.status === 403) {
    store.dispatch('clearAuth');
    router.push('/login');
  }
  return Promise.reject(error);
});

const bus = new Vue();
export default bus;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
