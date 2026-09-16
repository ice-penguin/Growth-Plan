/*
 * @Author: jianxl
 * @LastEditors: jianxl
 * @symbol_custom_string_obkoro1: I love coding
 */
import axios from 'axios'
import qs from 'qs'
import store from '@/store'
import storage from 'store'
import notification from 'ant-design-vue/es/notification'
import message from 'ant-design-vue/es/message'
import { VueAxios } from './axios'
import { ACCESS_TOKEN } from '@/store/mutation-types'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 60000 // 请求超时时间
})

// 异常拦截处理器
const errorHandler = error => {
  if (error.response) {
    const data = error.response.data
    // 从 localstorage 获取 token
    const token = storage.get(ACCESS_TOKEN)
    if (error.response.status === 403) {
      notification.error({
        message: '您无权访问',
        description: data.message
      })
    }
    if ((error.response.status === 401 || data.code === 401) && !(data.result && data.result.isLogin)) {
      notification.error({
        message: '登录超时',
        description: '请重新登录'
      })
      if (token) {
        store.dispatch('Logout').then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        })
      }
    }
    if (error.response.status === 400 || error.response.status === 404 || error.response.status === 409 || error.response.status === 500) {
      if (data.error) {
        message.error('系统错误，请联系管理员')
      } else {
        message.error(typeof data.data === 'object' ? data.data.message : data.data)
      }
    }
  } else {
    message.error(typeof error.data.data === 'object' ? error.data.data.message : error.data.data)
  }
  return Promise.reject(error)
}

const getUrl = function(url, data, resource) {
  if (resource.data || resource.params) {
    resource.data = resource.data || {}
    // 获取url中的占位符
    const arr = []
    // eslint-disable-next-line
    url.replace(/\/:([^\/]*)/g, (str, s) => {
      // 初始化占位符
      arr.push(s)
      resource.data[s] = resource.data[s] ? resource.data[s] : ''
    })
    // 先替换占位符，然后根据请求方式进行追加参数
    // data优先，resource中的data次之
    for (const i in resource.data) {
      // 如果占位符初始值为空，且传参数不存在，跳过
      if (resource.data[i] === '' && !data[i]) {
        continue
      }
      // eslint-disable-next-line
      const regexStr = '(/)(:' + i + ')'
      // 如果传入数据中存在，使用传入的数据
      url = url.replace(new RegExp(regexStr), '$1' + (data[i] || resource.data[i]))
      // // 删除data中的此属性
      // delete data[i]
    }
    // console.log('url', url)
    arr.map(str => {
      if (resource.data) delete resource.data[str]
      if (resource.params) delete resource.params[str]
    })
    // 清除不存在占位符
    // eslint-disable-next-line
    url = url.replace(/(\/:.*)(.{0}|[^\/])/g, '')
  }
  const config = {
    url: url,
    data: resource.data
  }
  return config
}

// request interceptor
request.interceptors.request.use(config => {
  const token = storage.get(ACCESS_TOKEN)
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (token) {
    // config.headers['Access-Token'] = token
    config.headers['Authorization'] = 'Bearer ' + token
  }
  let params = 'data'
  if (config.method === 'get') {
    params = 'params'
    config.paramsSerializer = params => {
      return qs.stringify(params, { arrayFormat: 'repeat' })
    }
  }
  const obj = getUrl(config.url, config[params], config)
  config.url = obj.url
  config.data = obj.data
  const data = config[params]
  if (data && data.pageNo) {
    data.page = data.pageNo
    data.itemsPerPage = data.pageSize
    delete data.pageNo
    delete data.pageSize
  }

  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use(response => {
  if (response.config && response.config.responseType === 'blob') {
    const contentType = (response.headers && (response.headers['content-type'] || response.headers['Content-Type'])) || ''
    if (contentType.indexOf('application/json') !== -1) {
      return response.data.text().then(text => {
        let parsed = {}
        try {
          parsed = JSON.parse(text)
        } catch (err) {
          parsed = { code: 500, data: '下载失败' }
        }
        if (parsed.code && parsed.code !== 200) {
          return errorHandler({ data: parsed })
        }
        return parsed
      })
    }
    return response
  }
  // 除了code值200外其他都走异常处理
  if (response.data && response.data.code !== 200) {
    // message.error(response.data.data.message)
    return errorHandler(response)
  }
  // if (response.data.code == 200) {
  return response.data
  // }
}, errorHandler)

const installer = {
  vm: {},
  install(Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export { installer as VueAxios, request as axios }
