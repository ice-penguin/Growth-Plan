<template>
  <view class="page">
    <view class="title">成长计划</view>
    <button type="primary" :loading="loading" @click="handleLogin">微信登录</button>
    <view v-if="error" class="error">{{ error }}</view>
  </view>
</template>

<script>
import { wxLogin, getMe } from '@/common/api.js'

export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      error: ''
    }
  },
  methods: {
    handleLogin() {
      const self = this
      self.error = ''
      self.loading = true
      uni.login({
        provider: 'weixin',
        success(loginRes) {
          if (!loginRes.code) {
            self.loading = false
            self.error = '未拿到微信 code'
            return
          }
          wxLogin(loginRes.code)
            .then(function (res) {
              if (!res || res.code !== 200) {
                throw new Error((res && res.data) || '登录失败')
              }
              const data = res.data || {}
              self.$store.commit('updateState', { key: '$token', value: data.token || '' })
              self.$store.commit('updateState', {
                key: '$userInfo',
                value: data.user || { openid: data.openid, role: data.role }
              })
              return getMe()
            })
            .then(function (meRes) {
              if (meRes && meRes.code === 200 && meRes.data && meRes.data.result) {
                self.$store.commit('updateState', { key: '$userInfo', value: meRes.data.result })
              }
              uni.switchTab({ url: '/pages/home/index' })
            })
            .catch(function (err) {
              self.error = (err && err.message) || String(err)
            })
            .finally(function () {
              self.loading = false
            })
        },
        fail(err) {
          self.loading = false
          self.error = (err && err.errMsg) || 'uni.login 失败'
        }
      })
    }
  }
}
</script>

<style>
.page {
  padding: 64rpx 48rpx;
}
.title {
  font-size: 40rpx;
  margin-bottom: 48rpx;
}
.error {
  margin-top: 24rpx;
  color: #c00;
  font-size: 26rpx;
}
</style>
