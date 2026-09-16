import { createPostRequest } from '../createPostRequest'

export const configUpdate = createPostRequest('/api/config/update')
export const configShow = createPostRequest('/api/config/show')
export const configExtraRulesUpdate = createPostRequest('/api/config/extra/rules/update')
