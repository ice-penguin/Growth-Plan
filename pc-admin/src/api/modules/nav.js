import { createPostRequest } from '../createPostRequest'

export const navUpdateDefault = createPostRequest('/api/nav/update/default')
export const navGetDefault = createPostRequest('/api/nav/get/default')
export const navGetOther = createPostRequest('/api/nav/get/other')
export const navGetLogin = createPostRequest('/api/nav/get/login')
