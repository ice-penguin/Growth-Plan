/*
 * @Author: jianxl
 * @LastEditors: jianxl
 * @symbol_custom_string_obkoro1: I love coding
 */
import storage from 'store'
import { login, logout, userMe } from '@/api/request'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'
import Vue from 'vue'
const user = {
  state: {
    userId: '',
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {},
    orgInfo: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_USER_ID: (state, userId) => {
      state.userId = userId
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    },
    SRT_ORG_INFO: (state, orgInfo) => {
      state.orgInfo = orgInfo
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo)
          .then(response => {
            const token = response.data.token
            Vue.$cookies.set('token', '"' + token + '"')
            resolve()
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // 获取用户信息
    GetInfo({ commit }) {
      return new Promise((resolve, reject) => {
        userMe()
          .then(response => {
            const result = {
              role: response.data.result.role,
              name: response.data.result.name,
              userId: response.data.result._id
            }
            commit('SET_ROLES', result.role.split(','))
            commit('SET_INFO', result)
            commit('SET_USER_ID', result.userId)
            commit('SET_NAME', { name: result.name, welcome: welcome() })
            resolve(response)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // 登出
    Logout({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout()
        .then(response => {
          storage.remove(ACCESS_TOKEN)
          storage.remove('orgInfo')
          commit('SET_INFO', {})
          commit('SET_ROLES', [])
          Vue.$cookies.remove('token')
          resolve()
        })
        .catch(error => {
          console.log(error, '退出登录token过期报错')
          storage.remove(ACCESS_TOKEN)
          storage.remove('orgInfo')
          commit('SET_INFO', {})
          commit('SET_ROLES', [])
          Vue.$cookies.remove('token')
          resolve()
        })
      })
    }
  }
}

export default user
