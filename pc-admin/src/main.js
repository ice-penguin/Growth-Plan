/*
 * @Author: jianxl
 * @LastEditors: jianxl
 * @symbol_custom_string_obkoro1: I love coding
 */
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Vue from 'vue'
import VueCookies from 'vue-cookies'
import App from './App.vue'
import router from './router'
import store from './store/'
import i18n from './locales'
import 'ant-design-vue/dist/antd.less'
import { VueAxios } from './utils/request'
import { FormModel, Timeline } from 'ant-design-vue'
import ProLayout, { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
import themePluginConfig from '../config/themePluginConfig'

import bootstrap from './core/bootstrap'
import './core/lazy_use'
import './permission'
import './utils/filter'
import './global.less'
import './utils/public.less'
import { preventReClick } from './utils/util'
import moment from 'moment'
import fileDownload from 'js-file-download'

Vue.config.productionTip = false

Vue.use(VueAxios)
Vue.use(FormModel)
Vue.use(Timeline)
Vue.use(preventReClick)
Vue.use(VueCookies)

Vue.component('pro-layout', ProLayout)
Vue.component('page-container', PageHeaderWrapper)
Vue.component('page-header-wrapper', PageHeaderWrapper)

window.umi_plugin_ant_themeVar = themePluginConfig.theme

Vue.prototype.moment = moment
moment.locale('zh-cn')
Vue.prototype.fileDownload = fileDownload

Vue.prototype.keyEnter = function(vm, functionname, keycode, params) {
  document.onkeyup = function(e) {
    const even = e || window.event
    const key = even.keyCode
    if (key === keycode) {
      even.stopPropagation()
      even.preventDefault()
      vm[functionname](params)
    }
  }
}

new Vue({
  router,
  store,
  i18n,
  created: bootstrap,
  render: h => h(App)
}).$mount('#app')
