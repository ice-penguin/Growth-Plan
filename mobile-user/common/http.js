import config from './config.js'
import store from '@/store/index.js'

const http = function (options) {
  return new Promise(function (resolve, reject) {
    const token = store.state.$token
    uni.request({
      url: (options.baseURL || config.baseUrl) + options.url,
      method: options.method || 'POST',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        // 小程序鉴权：Authorization: Wechat <token>（对齐华润 mobile-front-client）
        Authorization: token ? ('Wechat ' + token) : ''
      },
      success: function (res) {
        resolve(res.data)
      },
      fail: function (err) {
        reject(err)
      }
    })
  })
}

export default http
