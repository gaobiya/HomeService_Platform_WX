import { request } from '../utils/request'

/**
 * 用户登录
 */
export function login(code, role) {
  return request('/user/login', 'POST', { code, role })
}

/**
 * 获取用户信息
 */
export function getUserInfo(userId) {
  return request('/user/info', 'GET', { userId })
}

/**
 * 更新用户信息
 */
export function updateUser(userInfo) {
  return request('/user/update', 'PUT', userInfo)
}
