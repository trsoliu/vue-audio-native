import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

//import vueAudio from '../packages/index'/
import vueAudio from '../lib/vue-audio.umd.js'
Vue.use(vueAudio)
//console.log(vueAudio)
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
