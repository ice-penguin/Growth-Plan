/**
 * 开发 / 测试环境对接配置
 * 切换环境：改 common/config.js 顶部 require
 * 对应 server development / tool/config/dev.config.js
 */
module.exports = {
  name: 'dev', // 环境标识
  baseUrl: 'http://localhost:9000' // 后端 API 根地址（上线前改成开发机地址）
}
