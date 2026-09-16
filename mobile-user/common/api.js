import http from './http.js'

/**
 * 小程序登录：uni.login code → 服务端 Wechat token
 * POST /auth/wx/login
 */
export function wxLogin(code) {
  return http({
    url: '/auth/wx/login',
    data: { code }
  })
}

/**
 * 小程序登出
 * POST /auth/wx/logout
 */
export function wxLogout() {
  return http({
    url: '/auth/wx/logout',
    data: {}
  })
}

/**
 * 当前用户
 * POST /api/user/me
 */
export function getMe() {
  return http({
    url: '/api/user/me',
    data: {}
  })
}
