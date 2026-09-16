import { createPostRequest } from '../createPostRequest'

export const userUpdate = createPostRequest('/api/user/update')
export const userResetPassword = createPostRequest('/api/user/reset/password')
export const userUpdatePassword = createPostRequest('/api/user/update/password')
export const userIndex = createPostRequest('/api/user/index')
export const userDelete = createPostRequest('/api/user/delete')
export const userMe = createPostRequest('/api/user/me')
