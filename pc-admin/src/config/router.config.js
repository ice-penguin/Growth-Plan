// eslint-disable-next-line
import { UserLayout, BasicLayout, RouteView } from '@/layouts'

export const asyncRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.home' },
    redirect: '/welcome',
    children: [
      {
        path: '/admin',
        name: 'Admin',
        component: RouteView,
        meta: { title: 'admin管理端', icon: 'control' },
        children: [
          {
            path: '/admin/menu',
            name: 'menu',
            component: RouteView,
            meta: { title: '菜单管理', keepAlive: false },
            children: [
              {
                path: '/admin/menu/settings',
                name: 'Settings',
                component: () => import('@/views/admin/menu/settings'),
                meta: { title: '菜单设置' }
              },
              {
                path: '/admin/menu/define',
                name: 'Define',
                component: () => import('@/views/admin/menu/define'),
                meta: { title: '菜单定义' }
              }
            ]
          }
        ]
      },
      {
        path: '/welcome',
        name: 'Welcome',
        component: () => import('@/views/welcome/'),
        meta: { title: '首页', icon: 'home' }
      },
      {
        path: '/setting',
        name: 'Setting',
        component: RouteView,
        meta: { title: '设置', icon: 'setting' },
        children: [
          {
            path: '/setting/general',
            name: 'SettingGeneral',
            component: () => import('@/views/setting/general/index'),
            meta: { title: '通用设置' }
          },
          {
            path: '/setting/staff',
            name: 'Staff',
            component: RouteView,
            meta: { title: '员工管理' },
            children: [
              {
                path: '/setting/staff/staff-account',
                name: 'SettingStaffAccount',
                component: () => import('@/views/setting/staff/account/index'),
                meta: { title: '员工账号' }
              },
              {
                path: '/setting/staff/staff-role',
                name: 'SettingStaffRole',
                component: () => import('@/views/setting/staff/role/index'),
                meta: { title: '角色权限' }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      }
    ]
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]
