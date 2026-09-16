import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const persistedKeys = ['$userInfo', '$token']

const loadPersistedState = function () {
  const state = {}
  persistedKeys.forEach(function (key) {
    try {
      const value = uni.getStorageSync(key)
      if (value) {
        state[key] = JSON.parse(value)
      }
    } catch (e) {}
  })
  return state
}

const store = new Vuex.Store({
  state: {
    $userInfo: {},
    $token: '',
    ...loadPersistedState()
  },
  mutations: {
    updateState: function (state, payload) {
      state[payload.key] = payload.value
      if (persistedKeys.indexOf(payload.key) !== -1) {
        uni.setStorageSync(payload.key, JSON.stringify(payload.value))
      }
    }
  }
})

export default store
