import Vue from 'vue'
import App from './App'
import store from './store'
import http from './common/http.js'
import mixin from './common/mixin'

Vue.prototype.$store = store
Vue.prototype.$HTTP = http
Vue.config.productionTip = false
App.mpType = 'app'
Vue.mixin(mixin)

const app = new Vue({
  store,
  ...App
})

app.$mount()
