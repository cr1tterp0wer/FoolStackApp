import "../custom.scss";
import "bootswatch/dist/slate/bootstrap.min.css";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import App from "App.vue";
import SocketIO from "socket.io-client";
import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import axios from "axios";
import mixins from "helpers/common";
import router from "router";
import store from "store";

const bus = new Vue(),
	serverURL = process.env.VUE_APP_SERVER_URL;
Vue.use(new VueSocketIO({
		debug: true,
		connection: SocketIO(process.env.VUE_APP_SOCKET_URL), // eslint-disable-line new-cap
		vuex: {
			store,
			actionPrefix: "SOCKET_",
			mutationPrefix: "SOCKET_",
		},
		options: { path: "/" },
	}));

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.config.productionTip = false;
Vue.prototype.$axios = axios;

if (serverURL) {
	axios.defaults.baseURL = serverURL;
}

axios.defaults.headers.post["Content-Type"] = "application/json";
axios.interceptors.request.use((req) => {
	req.headers.authorization = store.state.token || ""; // eslint-disable-line no-param-reassign

	return req;
});

axios.interceptors.response.use(
	(res) => {
		store.dispatch("refreshIsLogged");

		return res;
	},
	(error) => {
		if (error.response.status === 403) {
			store.dispatch("clearAuth");
			router.push("/login");
		}

		return Promise.reject(error);
	}
);

export default bus;
new Vue({
	mixins: [mixins],
	router,
	store,
	render: (element) => element(App),
}).$mount("#app");
