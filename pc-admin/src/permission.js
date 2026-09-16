import router from './router'
import store from './store'
import storage from 'store'
import NProgress from 'nprogress'
import '@/components/NProgress/nprogress.less'
import notification from 'ant-design-vue/es/notification'
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { i18nRender } from '@/locales'
import Vue from 'vue'

NProgress.configure({ showSpinner: false })

const allowList = ['login']
const loginRoutePath = '/user/login'
const defaultRoutePath = '/welcome'

// 安全访问路由children的辅助函数
function getSafeChildren(routes, index = 0) {
  if (!Array.isArray(routes) || routes.length <= index) {
    return []
  }
  return routes[index].children || []
}

router.beforeEach((to, from, next) => {
  NProgress.start()
  to.meta && (typeof to.meta.title !== 'undefined' && setDocumentTitle(`${i18nRender(to.meta.title)} - ${domTitle}`))

  const getToken = function () {
    let token = Vue.$cookies.get('token')
    if (token) {
      token = token.replace(/"/g, '')
      storage.set(ACCESS_TOKEN, token, 16 * 60 * 60 * 1000)
    } else {
      storage.remove(ACCESS_TOKEN)
    }
  }
  getToken()

  if (storage.get(ACCESS_TOKEN)) {
    if (to.path === loginRoutePath) {
      next({ path: defaultRoutePath })
      NProgress.done()
    } else {
      if (store.getters.roles.length === 0) {
        store
          .dispatch('GetInfo')
          .then(res => {
            store.dispatch('GenerateRoutes').then(() => {
              // 增加路由数据校验
              if (!Array.isArray(store.getters.addRouters) || store.getters.addRouters.length === 0) {
                console.error('Generated routes is empty or invalid')
                return next(defaultRoutePath)
              }
              const addRouters = [...store.getters.addRouters]
              // 根据不同角色处理路由
              try {
                getSafeChildren(addRouters)
                // 安全添加路由
                router.addRoutes(addRouters)
                
                const redirect = decodeURIComponent(from.query.redirect || to.path)
                if (to.path === redirect) {
                  next({ ...to, replace: true })
                } else {
                  next({ path: redirect })
                }
              } catch (err) {
                console.error('Route processing error:', err)
                next(defaultRoutePath)
              }
            })
          })
          .catch(err => {
            console.error('Get user info error:', err)
            notification.error({
              message: '错误',
              description: '请求用户信息失败，请重试'
            })
            store.dispatch('Logout').then(() => {
              next({ path: loginRoutePath, query: { redirect: to.fullPath } })
            })
          })
      } else {
        next()
      }
    }
  } else {
    if (allowList.includes(to.name)) {
      next()
    } else {
      next({ path: loginRoutePath, query: { redirect: to.fullPath } })
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
