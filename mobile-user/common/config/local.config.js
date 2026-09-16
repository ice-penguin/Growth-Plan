/**
 * 本地环境对接配置
 * 切换环境：改 common/config.js 顶部 require
 * 对应 server local / tool/config/local.config.js
 */
module.exports = {
  name: 'local', // 环境标识
  baseUrl: 'http://localhost:9000' // 后端 API 根地址
}
