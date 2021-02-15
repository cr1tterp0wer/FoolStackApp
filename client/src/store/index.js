import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const TOKEN = process.env.VUE_APP_TOKEN || 'nu_social_t';
const USER_ID = process.env.VUE_APP_UID || 'nu_uid';
const USER = process.env.VUE_APP_USER || 'nu_user';

export default new Vuex.Store({

  state: {
    token: null,
    user: null,
    userID: null,
    isLogged: false,
  },

  mutations: {

    setToken(state, token) { state.token = token; },
    setUser(state, user) { state.user = user; },
    setUserID(state, userID) { state.userID = userID; },
    setIsLogged(state, isLogged) { state.isLogged = isLogged; },
    setUserAndID(state, user) {
      state.user = user;
      state.userID = user.id;
    },

    // CLEAR ALL cache
    clearAuth(state) {
      state.user = state.token = state.userID = null; // eslint-disable-line no-multi-assign
      state.isLogged = false;
    },

  },

  actions: {

    // SET accepts payload as arg
    setUser({ commit }, user) { commit('setUser', user); },
    setUserID({ commit }, userID) { commit('setUserID', userID); },
    setToken({ commit }, token) { commit('setToken', token); },
    setIsLogged({ commit }, isLogged) { commit('setIsLogged', isLogged); },

    // REFRESH fetches payload from localStorage
    refreshUser({ commit }) { commit('setUser', localStorage.getItem(USER)); },
    refreshUserID({ commit }) { commit('setUserID', localStorage.getItem(USER_ID)); },
    refreshToken({ commit }) { commit('setToken', localStorage.getItem(TOKEN)); },
    refreshIsLogged({ commit }) {
      const isLogged = !!(localStorage.getItem(TOKEN) && localStorage.getItem(USER));
      commit('setIsLogged', isLogged);
    },
    refreshAuth({ commit, state, dispatch }) {
      dispatch('refreshUser');
      dispatch('refreshUserID');
      dispatch('refreshToken');
      commit('setIsLogged', !!(state.token && state.user));
    },

    /**
     * SET localStorage and cache with payload
     * @param {Actionble} commit
     * @param {Object} data - form of { user: {Object}, token: String}
     */
    setAuth({ commit, state }, data) {
      const { user, token } = data;

      commit('setUser', user); // must occur first
      commit('setUserID', user.id);
      commit('setToken', token);
      commit('setIsLogged', !!(state.token && state.user));

      localStorage.setItem(USER, JSON.stringify(user));
      localStorage.setItem(USER_ID, user.id);
      localStorage.setItem(TOKEN, token);
    },

    // CLEAR localStorage and cache
    clearAuth({ commit }) {
      commit('clearAuth');
      localStorage.clear();
    },

    setUserData({ commit, state }, user) {
      commit('setUser', user); // must occur first
      commit('setUserID', user.id);
      commit('setIsLogged', !!(state.token && state.user));

      localStorage.setItem(USER, JSON.stringify(user));
      localStorage.setItem(USER_ID, user.id);
    },

  },

  modules: {},
});
