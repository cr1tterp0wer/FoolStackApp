import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store";

Vue.use(VueRouter);

const HOME = "Home";
const LOGIN = "Login";
const LOGOUT = "Login";
const NOT_FOUND = "PageNotFound";
const PASS_RESET = "PasswordReset";
const USER_VALIDATE = "UserValidate";
const SIGNUP = "Signup";
const ABOUT_US = "AboutUs";
const AUTH_STUBS = [LOGIN, SIGNUP];
const UN_AUTH_STUBS = [HOME, LOGOUT];

/**
 * Guards routes from logged in user
 */
const authGuard = (to, from, next) => {
  if (AUTH_STUBS.includes(to.name) && store.state.isLogged) next({ name: HOME });
  else next();
};

/**
 * Guards routes from logged out user
 */
const unAuthGuard = (to, from, next) => {
  if (UN_AUTH_STUBS.includes(to.name) && !store.state.isLogged) next({ name: LOGIN });
  else next();
};

const routes = [
  {
    path: "/Home",
    name: HOME,
    beforeEnter: unAuthGuard,
    component: () => import(/* webpackChunkName: 'Home' */ "../views/Home.vue"),
    meta: { reuse: false },
  },
  {
    path: "/Login",
    name: LOGIN,
    beforeEnter: authGuard,
    component: () => import(/* webpackChunkName: 'Login' */ "../views/Login.vue"),
    meta: { reuse: false },
  },
  {
    path: "/SignUp",
    name: SIGNUP,
    beforeEnter: authGuard,
    component: () => import(/* webpackChunkName: 'Signup' */ "../views/Signup.vue"),
    meta: { reuse: false },
  },
  {
    path: "/AboutUs",
    name: "AboutUs",
    component: () => import(/* webpackChunkName: 'AboutUs' */ "../views/AboutUs.vue"),
    meta: { reuse: false },
  },
  {
    path: "/PasswordReset",
    name: PASS_RESET,
    beforeEnter: authGuard,
    component: () => import(/* webpackChunkName: 'PasswordReset' */ "../views/PasswordReset.vue"),
  },
  {
    path: "/UserValidate",
    name: USER_VALIDATE,
    beforeEnter: authGuard,
    component: () => import(/* webpackChunkName: 'UserValidate' */ "../views/UserValidate.vue"),
  },
  {
    path: "/PageNotFound",
    name: NOT_FOUND,
    component: () => import(/* webpackChunkName: 'PageNotFound' */ "../views/PageNotFound.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: NOT_FOUND },
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

/**
 * RefreshAuth before each route
 */
router.beforeEach((to, from, next) => {
  console.log(store.state.isLogged);
  store.dispatch("refreshAuth");
  next();
});

export default router;
