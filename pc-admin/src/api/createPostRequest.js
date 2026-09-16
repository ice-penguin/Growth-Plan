import request from '@/utils/request'

/**
 * 创建 POST 请求函数
 * @param {string} url
 * @returns {(data?: object, headers?: object) => Promise}
 */
export const createPostRequest = url => (data, headers) => request({
  url,
  method: 'post',
  data,
  ...(headers && { headers })
})
