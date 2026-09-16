import Vue from 'vue'
import Router from 'vue-router'
import { constantRouterMap } from '@/config/router.config'
import message from 'ant-design-vue/es/message'

// hack router push callback
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

const router = new Router({
  base: '/',
  mode: 'history',
  routes: constantRouterMap
})

router.onError(error => {
  const pattern = /Loading chunk chunk-(.*)+ failed/g
  const isChunkLoadFailed = error.message.match(pattern)
  if (isChunkLoadFailed) {
    message.warn('系统已升级，正在刷新本地存储，请稍候...')
    location.reload()
  }
})

export default router
