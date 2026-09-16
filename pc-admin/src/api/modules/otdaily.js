import { createPostRequest } from '../createPostRequest'
import request from '@/utils/request'

export const otdailyUpdate = createPostRequest('/api/otdaily/update')
export const otdailyIndex = createPostRequest('/api/otdaily/index')
export const otdailyDelete = createPostRequest('/api/otdaily/delete')
export const otdailyMealCalendar = createPostRequest('/api/otdaily/meal/calendar')
export const otdailyMonthSummary = createPostRequest('/api/otdaily/month/summary')
export const otdailyReview = createPostRequest('/api/otdaily/review')

export const otdailyDownload = data =>
  request({
    url: '/api/otdaily/download',
    method: 'post',
    data,
    responseType: 'blob',
    timeout: 300000
  })

export const otdailyReviewImport = formData =>
  request({
    url: '/api/otdaily/review/import',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  })

export const otdailyReimburseExport = data =>
  request({
    url: '/api/otdaily/reimburse/export',
    method: 'post',
    data,
    responseType: 'blob',
    timeout: 120000
  })
