import { createPostRequest } from '../createPostRequest'
import request from '@/utils/request'

export const attendanceImportIndex = createPostRequest('/api/attendance/import/index')
export const attendanceTaxiCalendar = createPostRequest('/api/attendance/taxi/calendar')

export const attendanceImportExcel = (formData) =>
  request({
    url: '/api/attendance/import',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const attendanceTaxiCalendarExport = data =>
  request({
    url: '/api/attendance/taxi/calendar/export',
    method: 'post',
    data,
    responseType: 'blob',
    timeout: 120000
  })
