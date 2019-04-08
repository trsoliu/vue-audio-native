import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import vueAudioNative from '../packages/index'
//import vueAudioNative from '../lib/vue-audio-native.umd.js'
//import vueAudioNative from 'vue-audio-native';
Vue.use(vueAudioNative)
//console.log(vueAudioNative)
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
