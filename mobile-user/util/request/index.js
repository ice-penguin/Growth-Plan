import config from '@/common/config'

module.exports = function () {
  // 接入 uView 后在这里挂 uni.$u.http，和华润小程序 util/request 一样
  console.log('request baseUrl', config.baseUrl)
}
