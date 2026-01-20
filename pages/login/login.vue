<template>
	<view class="login-container">
		<view class="login-header">
			<text class="title">家政服务预约平台</text>
		</view>
		
		<view class="login-content">
			<!-- 登录/注册切换 -->
			<view class="tab-bar">
				<view 
					class="tab-item" 
					:class="{ active: currentTab === 'login' }"
					@click="switchTab('login')"
				>
					登录
				</view>
				<view 
					class="tab-item" 
					:class="{ active: currentTab === 'register' }"
					@click="switchTab('register')"
				>
					注册
				</view>
			</view>
			
			<!-- 角色选择 -->
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
			
			<!-- 登录表单 -->
			<view v-if="currentTab === 'login'" class="form-container">
				<view class="form-item">
					<text class="label">用户名/手机号</text>
					<input 
						class="input" 
						v-model="loginForm.username" 
						placeholder="请输入用户名或手机号"
						maxlength="20"
					/>
				</view>
				<view class="form-item">
					<text class="label">密码</text>
					<input 
						class="input" 
						v-model="loginForm.password" 
						placeholder="请输入密码"
						password
						maxlength="20"
					/>
				</view>
				<button 
					class="submit-btn" 
					@click="handleLogin" 
					:disabled="!canLogin || loading"
				>
					{{ loading ? '登录中...' : '登录' }}
				</button>
			</view>
			
			<!-- 注册表单 -->
			<view v-if="currentTab === 'register'" class="form-container">
				<view class="form-item">
					<text class="label">用户名</text>
					<input 
						class="input" 
						v-model="registerForm.username" 
						placeholder="3-20个字符"
						maxlength="20"
					/>
				</view>
				<view class="form-item">
					<text class="label">手机号</text>
					<input 
						class="input" 
						v-model="registerForm.phone" 
						placeholder="请输入手机号"
						type="number"
						maxlength="11"
					/>
				</view>
				<view class="form-item">
					<text class="label">密码</text>
					<input 
						class="input" 
						v-model="registerForm.password" 
						placeholder="6-20个字符"
						password
						maxlength="20"
					/>
				</view>
				<view class="form-item">
					<text class="label">确认密码</text>
					<input 
						class="input" 
						v-model="registerForm.confirmPassword" 
						placeholder="请再次输入密码"
						password
						maxlength="20"
					/>
				</view>
				<button 
					class="submit-btn" 
					@click="handleRegister" 
					:disabled="!canRegister || loading"
				>
					{{ loading ? '注册中...' : '注册' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import { login, register } from '../../api/user'

export default {
	data() {
		return {
			currentTab: 'login', // login 或 register
			selectedRole: '', // customer 或 worker
			loading: false,
			loginForm: {
				username: '',
				password: ''
			},
			registerForm: {
				username: '',
				phone: '',
				password: '',
				confirmPassword: ''
			}
		}
	},
	computed: {
		canLogin() {
			return this.selectedRole && 
			       this.loginForm.username.trim() && 
			       this.loginForm.password.trim()
		},
		canRegister() {
			return this.selectedRole && 
			       this.registerForm.username.trim() && 
			       this.registerForm.phone.trim() && 
			       this.registerForm.password.trim() && 
			       this.registerForm.confirmPassword.trim()
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
		switchTab(tab) {
			this.currentTab = tab
			// 切换时清空表单
			if (tab === 'login') {
				this.loginForm = { username: '', password: '' }
			} else {
				this.registerForm = { username: '', phone: '', password: '', confirmPassword: '' }
			}
		},
		selectRole(role) {
			this.selectedRole = role
		},
		handleLogin() {
			if (!this.canLogin) {
				uni.showToast({
					title: '请填写完整信息',
					icon: 'none'
				})
				return
			}
			
			// 验证手机号格式（如果是手机号）
			const phoneRegex = /^1[3-9]\d{9}$/
			if (this.loginForm.username.match(phoneRegex)) {
				// 是手机号，验证格式
			} else if (this.loginForm.username.length < 3) {
				uni.showToast({
					title: '用户名至少3个字符',
					icon: 'none'
				})
				return
			}
			
			this.loading = true
			login(this.loginForm.username, this.loginForm.password, this.selectedRole)
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
					uni.showToast({
						title: err.message || '登录失败',
						icon: 'none'
					})
				})
				.finally(() => {
					this.loading = false
				})
		},
		handleRegister() {
			if (!this.canRegister) {
				uni.showToast({
					title: '请填写完整信息',
					icon: 'none'
				})
				return
			}
			
			// 表单验证
			if (this.registerForm.username.length < 3 || this.registerForm.username.length > 20) {
				uni.showToast({
					title: '用户名长度必须在3-20个字符之间',
					icon: 'none'
				})
				return
			}
			
			const phoneRegex = /^1[3-9]\d{9}$/
			if (!phoneRegex.test(this.registerForm.phone)) {
				uni.showToast({
					title: '手机号格式不正确',
					icon: 'none'
				})
				return
			}
			
			if (this.registerForm.password.length < 6 || this.registerForm.password.length > 20) {
				uni.showToast({
					title: '密码长度必须在6-20个字符之间',
					icon: 'none'
				})
				return
			}
			
			if (this.registerForm.password !== this.registerForm.confirmPassword) {
				uni.showToast({
					title: '两次输入的密码不一致',
					icon: 'none'
				})
				return
			}
			
			this.loading = true
			register({
				username: this.registerForm.username,
				password: this.registerForm.password,
				phone: this.registerForm.phone,
				role: this.selectedRole
			})
				.then(response => {
					if (response.code === 200) {
						uni.showToast({
							title: '注册成功，请登录',
							icon: 'success'
						})
						
						// 切换到登录页，并填充用户名
						setTimeout(() => {
							this.switchTab('login')
							this.loginForm.username = this.registerForm.username
							this.registerForm = { username: '', phone: '', password: '', confirmPassword: '' }
						}, 1500)
					}
				})
				.catch(err => {
					console.error('注册失败:', err)
					uni.showToast({
						title: err.message || '注册失败',
						icon: 'none'
					})
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
	background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
	padding: 80rpx 40rpx;
}

.login-header {
	text-align: center;
	margin-bottom: 60rpx;
}

.title {
	display: block;
	font-size: 44rpx;
	color: #fff;
	font-weight: bold;
}

.login-content {
	background: #fff;
	border-radius: 20rpx;
	padding: 40rpx;
}

.tab-bar {
	display: flex;
	margin-bottom: 40rpx;
	border-bottom: 2rpx solid #eee;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 20rpx 0;
	font-size: 32rpx;
	color: #666;
	position: relative;
}

.tab-item.active {
	color: #1890FF;
	font-weight: bold;
}

.tab-item.active::after {
	content: '';
	position: absolute;
	bottom: -2rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 60rpx;
	height: 4rpx;
	background: #1890FF;
	border-radius: 2rpx;
}

.role-select {
	margin-bottom: 40rpx;
}

.label {
	display: block;
	font-size: 28rpx;
	color: #333;
	margin-bottom: 20rpx;
}

.role-buttons {
	display: flex;
	gap: 20rpx;
}

.role-btn {
	flex: 1;
	height: 70rpx;
	line-height: 70rpx;
	border: 2rpx solid #ddd;
	border-radius: 10rpx;
	background: #fff;
	color: #666;
	font-size: 26rpx;
}

.role-btn.active {
	border-color: #1890FF;
	background: #E6F7FF;
	color: #1890FF;
}

.form-container {
	margin-top: 20rpx;
}

.form-item {
	margin-bottom: 30rpx;
}

.form-item .label {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 10rpx;
}

.input {
	width: 100%;
	height: 80rpx;
	line-height: 80rpx;
	padding: 0 20rpx;
	border: 2rpx solid #ddd;
	border-radius: 10rpx;
	font-size: 28rpx;
	box-sizing: border-box;
}

.input:focus {
	border-color: #1890FF;
}

.submit-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background: #1890FF;
	color: #fff;
	border-radius: 10rpx;
	font-size: 32rpx;
	border: none;
	margin-top: 20rpx;
}

.submit-btn[disabled] {
	background: #ccc;
}
</style>
