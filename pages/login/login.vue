<template>
	<view class="login-container">
		<view class="login-header">
			<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			<text class="title">家政服务预约平台</text>
		</view>
		
		<view class="login-content">
			<view class="role-select">
				<text class="label">请选择您的身份：</text>
				<view class="role-buttons">
					<button 
						class="role-btn" 
						:class="{ active: selectedRole === 'customer' }"
						@click="selectRole('customer')"
					>
						我是客户
					</button>
					<button 
						class="role-btn" 
						:class="{ active: selectedRole === 'worker' }"
						@click="selectRole('worker')"
					>
						我是服务员
					</button>
				</view>
			</view>
			
			<button class="login-btn" @click="handleLogin" :disabled="!selectedRole || loading">
				{{ loading ? '登录中...' : '微信一键登录' }}
			</button>
		</view>
	</view>
</template>

<script>
import { login } from '../../api/user'

export default {
	data() {
		return {
			selectedRole: '',
			loading: false
		}
	},
	onLoad() {
		// 检查是否已登录
		const token = uni.getStorageSync('token')
		if (token) {
			uni.switchTab({
				url: '/pages/index/index'
			})
		}
	},
	methods: {
		selectRole(role) {
			this.selectedRole = role
		},
		handleLogin() {
			if (!this.selectedRole) {
				uni.showToast({
					title: '请选择身份',
					icon: 'none'
				})
				return
			}
			
			this.loading = true
			
			// 获取微信登录code
			uni.login({
				provider: 'weixin',
				success: (res) => {
					if (res.code) {
						login(res.code, this.selectedRole)
							.then(response => {
								if (response.code === 200) {
									uni.setStorageSync('token', response.data.token)
									uni.setStorageSync('userId', response.data.userId)
									uni.setStorageSync('role', response.data.role)
									uni.setStorageSync('username', response.data.username)
									
									uni.showToast({
										title: '登录成功',
										icon: 'success'
									})
									
									setTimeout(() => {
										uni.switchTab({
											url: '/pages/index/index'
										})
									}, 1000)
								}
							})
							.catch(err => {
								console.error('登录失败:', err)
							})
							.finally(() => {
								this.loading = false
							})
					} else {
						uni.showToast({
							title: '获取微信登录信息失败',
							icon: 'none'
						})
						this.loading = false
					}
				},
				fail: (err) => {
					console.error('微信登录失败:', err)
					// 开发环境模拟登录
					this.mockLogin()
				}
			})
		},
		// 开发环境模拟登录
		mockLogin() {
			const mockCode = 'mock_' + Date.now()
			login(mockCode, this.selectedRole)
				.then(response => {
					if (response.code === 200) {
						uni.setStorageSync('token', response.data.token)
						uni.setStorageSync('userId', response.data.userId)
						uni.setStorageSync('role', response.data.role)
						uni.setStorageSync('username', response.data.username)
						
						uni.showToast({
							title: '登录成功',
							icon: 'success'
						})
						
						setTimeout(() => {
							uni.switchTab({
								url: '/pages/index/index'
							})
						}, 1000)
					}
				})
				.catch(err => {
					console.error('登录失败:', err)
				})
				.finally(() => {
					this.loading = false
				})
		}
	}
}
</script>

<style scoped>
.login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 100rpx 40rpx;
}

.login-header {
	text-align: center;
	margin-bottom: 100rpx;
}

.logo {
	width: 150rpx;
	height: 150rpx;
	margin-bottom: 30rpx;
}

.title {
	display: block;
	font-size: 40rpx;
	color: #fff;
	font-weight: bold;
}

.login-content {
	background: #fff;
	border-radius: 20rpx;
	padding: 60rpx 40rpx;
}

.role-select {
	margin-bottom: 60rpx;
}

.label {
	display: block;
	font-size: 32rpx;
	color: #333;
	margin-bottom: 30rpx;
}

.role-buttons {
	display: flex;
	gap: 20rpx;
}

.role-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	border: 2rpx solid #ddd;
	border-radius: 10rpx;
	background: #fff;
	color: #666;
	font-size: 28rpx;
}

.role-btn.active {
	border-color: #1890FF;
	background: #E6F7FF;
	color: #1890FF;
}

.login-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background: #1890FF;
	color: #fff;
	border-radius: 10rpx;
	font-size: 32rpx;
	border: none;
}

.login-btn[disabled] {
	background: #ccc;
}
</style>
