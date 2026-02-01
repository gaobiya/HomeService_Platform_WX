<template>
	<view class="profile-page">
		<!-- 沉浸式顶部 -->
		<view class="profile-header">
			<view class="header-bg"></view>
			<view class="user-main animate-fade-in">
				<view class="avatar-box" @click="changeAvatar">
					<image 
						class="avatar-img" 
						:src="getAvatarUrl(userInfo.avatarUrl)" 
						mode="aspectFill"
					></image>
				</view>
				<view class="user-text">
					<text class="user-name">{{ userInfo.username || '家政用户' }}</text>
					<view class="role-tag">
						<text>{{ getRoleName(userInfo.role) }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<view class="profile-content scroll-body">
			<!-- 服务员：我的余额 -->
			<view class="info-card animate-slide-up" v-if="userInfo.role === 'worker'">
				<view class="card-header">
					<text class="title">我的余额</text>
				</view>
				<view class="balance-row">
					<text class="balance-label">可提现余额</text>
					<text class="balance-value">¥ {{ formatBalance(userInfo.balance) }}</text>
				</view>
				<button class="withdraw-btn" @click="goToWithdraw">提现</button>
			</view>
			
			<!-- 基本资料 / 安全设置 入口 -->
			<view class="info-card animate-slide-up" :class="{ 'delay-1': userInfo.role === 'worker' }">
				<view class="card-header">
					<text class="title">账号与安全</text>
				</view>
				<view class="menu-group">
					<view class="modern-menu-item" @click="goToBasicInfo">
						<view class="menu-left">
							<text>基本资料</text>
						</view>
						<text class="arrow">></text>
					</view>
					<view class="modern-menu-item" @click="goToSecurity">
						<view class="menu-left">
							<text>安全设置</text>
						</view>
						<text class="arrow">></text>
					</view>
				</view>
			</view>
			
			<!-- 工作人员管理区 -->
			<view class="info-card animate-slide-up delay-2" v-if="userInfo.role === 'worker'">
				<view class="card-header">
					<text class="title">服务管理</text>
				</view>
				<view class="menu-group">
					<view class="modern-menu-item" @click="goToServiceTypes">
						<view class="menu-left">
							<text>我的服务项目</text>
						</view>
						<text class="arrow">></text>
					</view>
					<view class="modern-menu-item" @click="goToSchedule">
						<view class="menu-left">
							<text>接单日程配置</text>
						</view>
						<text class="arrow">></text>
					</view>
				</view>
			</view>
			
			<!-- 退出按钮 -->
			<view class="logout-section animate-slide-up delay-3">
				<button class="logout-red-btn" @click="handleLogout">
					<text>退出登录</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import { getUserInfo } from '../../api/user'

export default {
	data() {
		return {
			userInfo: {}
		}
	},
	onLoad() {
		this.loadUserInfo()
	},
	methods: {
		loadUserInfo() {
			const userId = uni.getStorageSync('userId')
			if (!userId) {
				uni.reLaunch({ url: '/pages/login/login' })
				return
			}
			getUserInfo(userId).then(res => {
				if (res.code === 200) this.userInfo = res.data
			})
		},
		changeAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.uploadAvatarFile(res.tempFilePaths[0])
				}
			})
		},
		uploadAvatarFile(filePath) {
			uni.showLoading({ title: '正在同步头像' })
			const userId = uni.getStorageSync('userId')
			uni.uploadFile({
				url: 'http://localhost:8080/api/user/upload-avatar',
				filePath: filePath,
				name: 'file',
				formData: { userId: userId },
				header: { 'Authorization': `Bearer ${uni.getStorageSync('token')}` },
				success: (res) => {
					const data = JSON.parse(res.data)
					if (data.code === 200) {
						uni.showToast({ title: '更新成功', icon: 'success' })
						this.loadUserInfo()
					}
				},
				complete: () => { uni.hideLoading() }
			})
		},
		goToBasicInfo() {
			uni.navigateTo({ url: '/pages/profile/basic-info' })
		},
		goToSecurity() {
			uni.navigateTo({ url: '/pages/profile/security' })
		},
		goToWithdraw() {
			uni.navigateTo({ url: '/pages/profile/withdraw' })
		},
		formatBalance(balance) {
			if (balance == null || balance === undefined) return '0.00'
			const n = parseFloat(balance)
			return isNaN(n) ? '0.00' : n.toFixed(2)
		},
		handleLogout() {
			uni.showModal({
				title: '安全退出',
				content: '退出后将需要重新登录，确定吗？',
				confirmColor: '#FF4D4F',
				success: (res) => {
					if (res.confirm) {
						uni.clearStorageSync()
						uni.reLaunch({ url: '/pages/login/login' })
					}
				}
			})
		},
		goToServiceTypes() { uni.navigateTo({ url: '/pages/worker/service-types' }) },
		goToSchedule() { uni.navigateTo({ url: '/pages/worker/schedule' }) },
		getRoleName(role) {
			const map = { 'customer': '普通客户', 'worker': '服务员' }
			return map[role] || role
		},
		formatDateTime(dateTime) {
			if (!dateTime) return '-'
			const d = new Date(dateTime)
			return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
		},
		getAvatarUrl(avatarUrl) {
			if (!avatarUrl) return '/static/default-avatar.png'
			if (avatarUrl.startsWith('http')) return avatarUrl
			return 'http://localhost:8080' + (avatarUrl.startsWith('/') ? '' : '/') + avatarUrl
		}
	}
}
</script>

<style lang="scss" scoped>
.profile-page {
	min-height: 100vh;
	background: #f8fafc;
}

/* 沉浸式头部 */
.profile-header {
	position: relative;
	height: 400rpx;
	padding: 0 50rpx;
	display: flex;
	align-items: center;
}

.header-bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, #1890ff 0%, #36a3ff 100%);
	border-bottom-right-radius: 80rpx;
	z-index: 0;
}

.user-main {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	margin-top: 40rpx;
}

.avatar-box {
	position: relative;
	margin-right: 32rpx;
	.avatar-img {
		width: 140rpx;
		height: 140rpx;
		border-radius: 70rpx;
		border: 6rpx solid rgba(255,255,255,0.4);
		box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.1);
	}
	.camera-btn {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 44rpx;
		height: 44rpx;
		background: #fff;
		border-radius: 22rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
		.iconfont { font-size: 24rpx; color: #1890ff; }
	}
}

.user-text {
	.user-name {
		display: block;
		font-size: 44rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 12rpx;
	}
	.role-tag {
		display: inline-flex;
		align-items: center;
		background: rgba(255,255,255,0.2);
		padding: 6rpx 20rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		color: #fff;
		gap: 8rpx;
	}
}

.profile-content {
	margin-top: -30rpx;
	position: relative;
	padding: 0 30rpx 100rpx;
}

/* 卡片样式 */
.info-card {
	background: #ffffff;
	border-radius: 36rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 8rpx 24rpx rgba(149, 157, 165, 0.05);
	
	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		gap: 12rpx;
		.iconfont { color: #1890ff; font-size: 32rpx; }
		.title { font-size: 30rpx; font-weight: bold; color: #333; }
	}
	.balance-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		.balance-label { font-size: 28rpx; color: #64748b; }
		.balance-value { font-size: 40rpx; font-weight: bold; color: #1890ff; }
	}
	.withdraw-btn {
		margin-top: 20rpx;
		height: 80rpx;
		line-height: 80rpx;
		background: linear-gradient(90deg, #1890ff, #40a9ff);
		color: #fff;
		border-radius: 40rpx;
		font-size: 28rpx;
		border: none;
	}
}

.form-item {
	display: flex;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 1px solid #f1f5f9;
	&.no-border { border-bottom: none; }

	.label {
		width: 160rpx;
		font-size: 28rpx;
		color: #64748b;
	}
	
	.value-input, .static-value {
		flex: 1;
		font-size: 28rpx;
		color: #1e293b;
	}
}

/* 按钮样式 */
.save-primary-btn {
	margin-top: 30rpx;
	height: 84rpx;
	line-height: 84rpx;
	background: linear-gradient(90deg, #1890ff, #40a9ff);
	color: #fff;
	border-radius: 42rpx;
	font-size: 28rpx;
	font-weight: bold;
	border: none;
}

.ghost-btn-blue {
	margin-top: 30rpx;
	height: 84rpx;
	line-height: 84rpx;
	background: #ebf5ff;
	color: #1890ff;
	border-radius: 42rpx;
	font-size: 28rpx;
	font-weight: 500;
	border: none;
}

/* 菜单项 */
.modern-menu-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 0;
	border-bottom: 1px solid #f1f5f9;
	&:last-child { border-bottom: none; }

	.menu-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
		font-size: 28rpx;
		color: #334155;
	}
	
	.menu-icon {
		width: 32rpx;
		height: 32rpx;
		background-size: contain;
		background-repeat: no-repeat;
		
		&.type-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>'); }
		&.schedule-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>'); }
	}
	
	.arrow, .icon-arrow-right { font-size: 24rpx; color: #cbd5e1; }
}

/* 退出部分 */
.logout-section {
	margin-top: 50rpx;
	text-align: center;
}

.logout-red-btn {
	width: 80%;
	height: 90rpx;
	line-height: 90rpx;
	background: #fff;
	color: #ef4444;
	border-radius: 45rpx;
	font-size: 30rpx;
	font-weight: bold;
	border: 1px solid #fee2e2;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(239, 68, 68, 0.05);
}

.version-text {
	display: block;
	margin-top: 40rpx;
	font-size: 22rpx;
	color: #94a3b8;
}

/* 动画库 */
@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

@keyframes slideUp {
	from { opacity: 0; transform: translateY(30rpx); }
	to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in { animation: fadeIn 0.8s ease; }
.animate-slide-up { animation: slideUp 0.6s ease-out; }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }

.iconfont { font-size: 32rpx; }
</style>
