import { createPostRequest } from '../createPostRequest'

export const login = createPostRequest('/auth/login')
export const logout = createPostRequest('/auth/logout')

export const authUpdate = createPostRequest('/api/auth/update')
export const authIndex = createPostRequest('/api/auth/index')
export const authDelete = createPostRequest('/api/auth/delete')
