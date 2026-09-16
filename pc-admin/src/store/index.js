/*
 * @Author: yzy
 * @LastEditors: jianxl
 * @I love coding too
 */
import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import user from './modules/user'

// default router permission control 默认导航从配置中获取动态生成
// import permission from './modules/permission'
// dynamic router permission control (Experimental) 从后台请求中获取
import asyncPermission from './modules/async-router'
import getters from './getters'

Vue.use(Vuex)
export default new Vuex.Store({
  modules: {
    app,
    user,
    permission: process.env.NODE_ENV === 'production' ? asyncPermission : asyncPermission
    // permission: permission
  },
  state: {},
  mutations: {},
  actions: {},
  getters
})
