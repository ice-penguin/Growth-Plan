import config from '@/common/config'

module.exports = function () {
  // 接入 uView 后在这里挂 uni.$u.http
  console.log('request baseUrl', config.baseUrl)
}
