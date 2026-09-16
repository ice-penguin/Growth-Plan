// eslint-disable-next-line
import { navGetLogin } from '@/api/request'
// eslint-disable-next-line
import { BasicLayout, BlankLayout, PageView, RouteView, UserLayout } from '@/layouts'

// 前端路由表
const constantRouterComponents = {
  // 基础 layout
  BasicLayout: BasicLayout,
  BlankLayout: BlankLayout,
  RouteView: RouteView,
  PageView: PageView,
  '403': () => import(/* webpackChunkName: "error" */ '@/views/exception/403'),
  '404': () => import(/* webpackChunkName: "error" */ '@/views/exception/404'),
  '500': () => import(/* webpackChunkName: "error" */ '@/views/exception/500'),

  Welcome: () => import('@/views/welcome/'),

  Exception403: () => import(/* webpackChunkName: "fail" */ '@/views/exception/403'),
  Exception404: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404'),
  Exception500: () => import(/* webpackChunkName: "fail" */ '@/views/exception/500'),

  UserLayout: UserLayout,
  login: () => import(/* webpackChunkName: "user" */ '@/views/user/Login'),

  adminOrganization: RouteView,
  Menu: RouteView,
  Settings: () => import('@/views/admin/menu/settings'),
  Define: () => import('@/views/admin/menu/define'),

  Setting: RouteView,
  SettingGeneral: () => import('@/views/setting/general/index'),
  Staff: RouteView,
  SettingStaffAccount: () => import('@/views/setting/staff/account/index'),
  SettingStaffRole: () => import('../views/setting/staff/role/index')
}

const notFoundRouter = {
  path: '*',
  redirect: '/404',
  hidden: true
}

const rootRouter = {
  key: '',
  name: 'index',
  path: '/',
  component: 'BasicLayout',
  meta: {
    title: '首页'
  },
  children: []
}

const childrenBasic = [
  {
    path: '/welcome',
    name: 'welcome',
    component: 'Welcome',
    meta: { title: '首页', show: true, icon: 'home' }
  }
]

/**
 * 动态生成菜单
 * @returns {Promise<Router>}
 */
export const generatorDynamicRouter = () => {
  return new Promise((resolve, reject) => {
    navGetLogin()
      .then(res => {
        const menuNav = []
        const childrenNav = res.data.navArr
        rootRouter.children = childrenBasic.concat(childrenNav)
        menuNav.push(rootRouter)
        const routers = generator(menuNav)
        routers.push(notFoundRouter)
        resolve(routers)
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * 格式化树形结构数据 生成 vue-router 层级路由表
 */
export const generator = (routerMap, parent) => {
  return routerMap.map(item => {
    const { title, show, hideChildren, target, icon, btns } = item.meta || {}
    let currentRouter = {}
    if (item.redirect) {
      currentRouter = {
        path: item.redirect,
        name: item.name || item.key || '',
        meta: {
          title: title,
          btns: btns
        }
      }
    } else {
      currentRouter = {
        path: item.path || `${(parent && parent.path) || ''}/${item.key}`,
        name: item.name || item.key || '',
        component: constantRouterComponents[item.component || item.key] || (() => import(`@/views/${item.component}`)),
        meta: {
          title: title,
          btns: btns
        }
      }
      if (target && target !== '_self') {
        currentRouter.meta.target = target
      }
      if (icon) {
        currentRouter.meta.icon = icon
      }
    }
    if (show === false) {
      currentRouter.hidden = true
    }
    if (hideChildren) {
      currentRouter.hideChildrenInMenu = true
    }
    if (!currentRouter.path.startsWith('http')) {
      currentRouter.path = currentRouter.path.replace('//', '/')
    }
    item.redirect && (currentRouter.redirect = item.redirect)
    if (item.children && item.children.length > 0) {
      currentRouter.children = generator(item.children, currentRouter)
    }
    return currentRouter
  })
}
