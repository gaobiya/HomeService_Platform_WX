import { request } from '../utils/request'

/**
 * 用户注册
 */
export function register(registerData) {
  return request('/user/register', 'POST', registerData)
}

/**
 * 用户登录（账号密码方式）
 */
export function login(username, password, role) {
  return request('/user/login', 'POST', { username, password, role })
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

/**
 * 修改密码
 */
export function changePassword(passwordData) {
  return request('/user/change-password', 'PUT', passwordData)
}

/**
 * 上传头像（使用uni.uploadFile，这里只是占位）
 */
export function uploadAvatar(userId, filePath) {
  // 实际使用uni.uploadFile在页面中调用
  return Promise.resolve()
}
