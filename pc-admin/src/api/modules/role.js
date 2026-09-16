import { createPostRequest } from '../createPostRequest'

export const roleUpdate = createPostRequest('/api/role/update')
export const roleUpdateAuth = createPostRequest('/api/role/update/auth')
export const roleIndex = createPostRequest('/api/role/index')
export const roleDelete = createPostRequest('/api/role/delete')
