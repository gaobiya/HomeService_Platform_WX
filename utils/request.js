/**
 * 请求工具类
 */
const BASE_URL = 'http://localhost:8080/api'

export function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    
    uni.request({
      url: BASE_URL + url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data)
          } else if (res.data.code === 401) {
            // 401 未授权：可能是登录失败或token过期
            const errorMessage = res.data.message || '未登录'
            
            // 清除登录信息
            uni.removeStorageSync('token')
            uni.removeStorageSync('userId')
            uni.removeStorageSync('role')
            uni.removeStorageSync('username')
            
            // 检查当前页面，如果是登录页则不跳转（避免循环跳转）
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            const isLoginPage = currentPage && (
              currentPage.route === 'pages/login/login' || 
              currentPage.route === 'pages/login/login.vue'
            )
            
            // 如果不在登录页，才跳转到登录页
            if (!isLoginPage) {
              uni.reLaunch({
                url: '/pages/login/login'
              })
            }
            
            // 显示具体的错误信息（登录页不显示，由登录页自己处理）
            if (!isLoginPage) {
              uni.showToast({
                title: errorMessage,
                icon: 'none',
                duration: 2000
              })
            }
            
            reject(new Error(errorMessage))
          } else {
            // 其他错误码，显示后端返回的错误信息
            const errorMessage = res.data.message || '请求失败'
            uni.showToast({
              title: errorMessage,
              icon: 'none'
            })
            reject(new Error(errorMessage))
          }
        } else {
          reject(new Error('网络错误'))
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}
