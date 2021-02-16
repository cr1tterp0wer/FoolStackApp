import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../store';

Vue.use(VueRouter);

const HOME = 'Home';
const LOGIN = 'Login';
const LOGOUT = 'Login';
const NOT_FOUND = 'PageNotFound';
const PASS_RESET = 'PasswordReset';
const USER_VALIDATE = 'UserValidate';
const SIGNUP = 'Signup';
const AUTH_STUBS = [LOGIN, SIGNUP];
const UN_AUTH_STUBS = [HOME, LOGOUT];

/**
 * Guards routes from logged in user
 */
const authGuard = (to, from, next) => {
  store.dispatch('refreshAuth');
  if (AUTH_STUBS.includes(to.name) && store.state.isLogged) next({ name: HOME });
  else next();
};

/**
 * Guards routes from logged out user
 */
const unAuthGuard = (to, from, next) => {
  store.dispatch('refreshAuth');
  if (UN_AUTH_STUBS.includes(to.name) && !store.state.isLogged) next({ name: LOGIN });
  else next();
};

const routes = [
  {
    path: '/',
    name: HOME,
    beforeEnter: unAuthGuard,
    component: () => import(/* webpackChunkName: 'Home' */ '../views/Home.vue'),
  },
  {
    path: '/login',
    name: LOGIN,
    beforeEnter: authGuard,
    component: () => import(/* webpackChunkName: 'Login' */ '../views/Login.vue'),
  },
  {
    path: '/signup',
    name: SIGNUP,
    beforeEnter: authGuard,
    component: () => import(/* webpackChunkName: 'Signup' */ '../views/Signup.vue'),
  },
  {
    path: '/reset-password',
    name: PASS_RESET,
    beforeEnter: authGuard,
    component: () => import(/* webpackChunkName: 'PasswordReset' */ '../views/PasswordReset.vue'),
  },
  {
    path: '/validate-user',
    name: USER_VALIDATE,
    beforeEnter: authGuard,
    component: () => import(/* webpackChunkName: 'UserValidate' */ '../views/UserValidate.vue'),
  },
  {
    path: '/not-found',
    name: NOT_FOUND,
    component: () => import(/* webpackChunkName: 'PageNotFound' */ '../views/PageNotFound.vue'),
  },
  {
    path: '/:pathMatch(.*)',
    redirect: '/not-found',
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

export default router;
