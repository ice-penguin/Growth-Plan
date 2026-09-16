/**
 * 向后端请求用户的菜单，动态生成路由
 */
import { constantRouterMap } from '@/config/router.config'
import { generatorDynamicRouter } from '@/router/generator-routers'

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      // 重复登陆此处会造成警告，由于addRouters导致路由name一致
      // console.log('state.routers', state.routers, constantRouterMap, routers)
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes ({ commit }) {
      return new Promise(resolve => {
        generatorDynamicRouter().then(routers => {
          // console.log('routers', routers)
          commit('SET_ROUTERS', routers)
          resolve()
        })
      })
    }
  }
}

export default permission
