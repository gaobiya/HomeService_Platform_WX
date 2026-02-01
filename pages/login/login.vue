<template>
	<view class="login-page">
		<!-- 背景图 -->
		<image class="bg-image" src="../../static/login.jpg" mode="aspectFill"></image>
		<view class="bg-mask"></view>
		
		<view class="login-container">
			<!-- Logo与标题 -->
			<view class="header-section">
				<image class="logo" src="../../static/loge.jpg" mode="aspectFit"></image>
				<view class="app-title">
					<text class="main-name">家政服务平台</text>
					<text class="sub-name">简单 · 舒心 · 专业</text>
				</view>
			</view>
			
			<!-- 登录卡片 -->
			<view class="login-card">
				<!-- Tab 切换 -->
				<view class="tab-box">
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
					<!-- 滑块 -->
					<view class="tab-slider" :class="currentTab"></view>
				</view>
				
				<!-- 身份选择 -->
				<view class="section-title">请选择身份</view>
				<view class="role-grid">
					<view 
						class="role-item" 
						:class="{ active: selectedRole === 'customer' }"
						@click="selectRole('customer')"
					>
						<view class="role-icon customer-icon"></view>
						<text>我是客户</text>
					</view>
					<view 
						class="role-item" 
						:class="{ active: selectedRole === 'worker' }"
						@click="selectRole('worker')"
					>
						<view class="role-icon worker-icon"></view>
						<text>我是服务员</text>
					</view>
				</view>
				
				<!-- 登录表单 -->
				<view v-if="currentTab === 'login'" class="form-body animate-fade-in">
					<view class="input-group">
						<view class="input-item">
							<text class="iconfont icon-user"></text>
							<input 
								type="text" 
								v-model="loginForm.username" 
								placeholder="请输入用户名或手机号"
								placeholder-style="color: #999"
							/>
						</view>
						<view class="input-item">
							<text class="iconfont icon-lock"></text>
							<input 
								password 
								v-model="loginForm.password" 
								placeholder="请输入登录密码"
								placeholder-style="color: #999"
							/>
						</view>
					</view>
					<button 
						class="submit-btn" 
						:class="{ disabled: !canLogin }" 
						@click="handleLogin"
						:loading="loading"
					>
						{{ loading ? '进入中...' : '立即登录' }}
					</button>
				</view>
				
				<!-- 注册表单 -->
				<view v-if="currentTab === 'register'" class="form-body animate-fade-in">
					<view class="input-group">
						<view class="input-item">
							<input type="text" v-model="registerForm.username" placeholder="设置用户名 (3-20位)" />
						</view>
						<view class="input-item">
							<input type="number" v-model="registerForm.phone" placeholder="请输入常用手机号" maxlength="11" />
						</view>
						<view class="input-item">
							<input password v-model="registerForm.password" placeholder="设置登录密码 (6-20位)" />
						</view>
						<view class="input-item">
							<input password v-model="registerForm.confirmPassword" placeholder="再次确认密码" />
						</view>
					</view>
					<button 
						class="submit-btn" 
						:class="{ disabled: !canRegister }" 
						@click="handleRegister"
						:loading="loading"
					>
						{{ loading ? '处理中...' : '注册并登录' }}
					</button>
				</view>
			</view>
			
			<!-- 底部版权或提示 -->
			<view class="page-footer">
				<text>© 2025 智慧家政服务. All Rights Reserved.</text>
			</view>
		</view>
	</view>
</template>

<script>
import { login, register } from '../../api/user'

export default {
	data() {
		return {
			currentTab: 'login',
			selectedRole: 'customer', // 默认选中客户
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
			return this.selectedRole && this.loginForm.username && this.loginForm.password
		},
		canRegister() {
			return this.selectedRole && this.registerForm.username && this.registerForm.phone && 
				   this.registerForm.password && this.registerForm.confirmPassword
		}
	},
	onLoad() {
		const token = uni.getStorageSync('token')
		if (token) {
			uni.switchTab({ url: '/pages/index/index' })
		}
	},
	methods: {
		switchTab(tab) {
			this.currentTab = tab
		},
		selectRole(role) {
			this.selectedRole = role
		},
		handleLogin() {
			if (!this.canLogin) return
			this.loading = true
			login(this.loginForm.username, this.loginForm.password, this.selectedRole)
				.then(res => {
					if (res.code === 200) {
						uni.setStorageSync('token', res.data.token)
						uni.setStorageSync('userId', res.data.userId)
						uni.setStorageSync('role', res.data.role)
						uni.setStorageSync('username', res.data.username)
						uni.showToast({ title: '欢迎回来', icon: 'success' })
						setTimeout(() => { uni.switchTab({ url: '/pages/index/index' }) }, 1000)
					}
				})
				.catch(err => {
					uni.showToast({ title: err.message || '登录失败', icon: 'none' })
				})
				.finally(() => { this.loading = false })
		},
		handleRegister() {
			if (!this.canRegister) return
			if (this.registerForm.password !== this.registerForm.confirmPassword) {
				return uni.showToast({ title: '密码输入不一致', icon: 'none' })
			}
			this.loading = true
			register({
				username: this.registerForm.username,
				password: this.registerForm.password,
				phone: this.registerForm.phone,
				role: this.selectedRole
			})
				.then(res => {
					if (res.code === 200) {
						uni.showToast({ title: '注册成功', icon: 'success' })
						setTimeout(() => { 
							this.switchTab('login')
							this.loginForm.username = this.registerForm.username
						}, 1500)
					}
				})
				.catch(err => {
					uni.showToast({ title: err.message || '注册失败', icon: 'none' })
				})
				.finally(() => { this.loading = false })
		}
	}
}
</script>

<style lang="scss" scoped>
.login-page {
	position: relative;
	width: 100%;
	height: 100vh;
	overflow: hidden;
}

.bg-image {
	position: absolute;
	width: 100%;
	height: 100%;
	filter: blur(10rpx);
	transform: scale(1.1);
}

.bg-mask {
	position: absolute;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.2);
}

.login-container {
	position: relative;
	z-index: 10;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0 50rpx;
}

/* Header Section */
.header-section {
	margin-top: 120rpx;
	margin-bottom: 60rpx;
	text-align: center;
	animation: slideDown 0.8s ease-out;
}

.logo {
	width: 160rpx;
	height: 160rpx;
	border-radius: 40rpx;
	background: #fff;
	box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.1);
	border: 6rpx solid rgba(255,255,255,0.6);
}

.app-title {
	margin-top: 30rpx;
	.main-name {
		display: block;
		font-size: 48rpx;
		font-weight: bold;
		color: #fff;
		letter-spacing: 4rpx;
		text-shadow: 0 4rpx 10rpx rgba(0,0,0,0.2);
	}
	.sub-name {
		font-size: 24rpx;
		color: rgba(255,255,255,0.8);
		margin-top: 10rpx;
		display: block;
	}
}

/* Login Card */
.login-card {
	width: 100%;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 40rpx;
	padding: 50rpx 40rpx;
	box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.1);
	animation: slideUp 0.8s ease-out;
}

/* Tab Switching */
.tab-box {
	display: flex;
	position: relative;
	background: #f5f7fa;
	border-radius: 20rpx;
	margin-bottom: 50rpx;
	padding: 8rpx;
}

.tab-item {
	flex: 1;
	height: 70rpx;
	line-height: 70rpx;
	text-align: center;
	font-size: 28rpx;
	color: #666;
	position: relative;
	z-index: 2;
	transition: all 0.3s;
	&.active {
		color: #1890ff;
		font-weight: bold;
	}
}

.tab-slider {
	position: absolute;
	top: 8rpx;
	width: calc(50% - 8rpx);
	height: 70rpx;
	background: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
	transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
	&.login { left: 8rpx; }
	&.register { left: 50%; }
}

/* Role Selection */
.section-title {
	font-size: 26rpx;
	color: #999;
	margin-bottom: 24rpx;
}

.role-grid {
	display: flex;
	gap: 30rpx;
	margin-bottom: 50rpx;
}

.role-item {
	flex: 1;
	height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2rpx solid #eee;
	border-radius: 20rpx;
	font-size: 26rpx;
	color: #666;
	transition: all 0.2s;
	background: #fff;
	gap: 12rpx;
	
	.role-icon {
		width: 32rpx;
		height: 32rpx;
		background-size: contain;
		background-repeat: no-repeat;
		opacity: 0.6;
	}
	
	&.active {
		border-color: #1890ff;
		background: #ebf5ff;
		color: #1890ff;
		font-weight: bold;
		box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.1);
		.role-icon { opacity: 1; }
	}
}

/* Form Styling */
.input-group {
	margin-bottom: 40rpx;
}

.input-item {
	height: 100rpx;
	border-bottom: 2rpx solid #f0f0f0;
	display: flex;
	align-items: center;
	padding: 0 10rpx;
	margin-bottom: 10rpx;
	
	input {
		flex: 1;
		height: 100%;
		font-size: 30rpx;
		color: #333;
	}
}

.submit-btn {
	width: 100%;
	height: 96rpx;
	line-height: 96rpx;
	background: linear-gradient(to right, #1890ff, #40a9ff);
	color: #fff;
	border-radius: 48rpx;
	font-size: 32rpx;
	font-weight: bold;
	box-shadow: 0 10rpx 30rpx rgba(24, 144, 255, 0.25);
	margin-top: 20rpx;
	border: none;
	
	&:active {
		transform: scale(0.98);
		opacity: 0.9;
	}
}

.submit-btn.disabled {
	background: #ccc;
	box-shadow: none;
	opacity: 0.6;
}

/* Footer */
.page-footer {
	margin-top: auto;
	margin-bottom: 40rpx;
	font-size: 22rpx;
	color: rgba(255,255,255,0.6);
}

/* Animations */
@keyframes slideDown {
	from { opacity: 0; transform: translateY(-40rpx); }
	to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
	from { opacity: 0; transform: translateY(60rpx); }
	to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
	animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

/* Icon Placeholders (Use iconfont if project includes it, otherwise these remain as gaps) */
.customer-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'); }
.worker-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>'); }
</style>
