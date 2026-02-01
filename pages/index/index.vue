<template>
	<view class="index-container">
		<!-- 背景装饰 -->
		<view class="bg-header"></view>
		
		<!-- 客户首页 -->
		<view v-if="userRole === 'customer'" class="home-wrapper">
			<view class="banner-section animate-slide-down">
				<view class="welcome-box">
					<text class="greet">您好，{{ username }}</text>
					<text class="slogan">发现美好生活，从预约服务开始</text>
				</view>
			</view>
			
			<view class="content-body">
				<view class="section-header">
					<text class="title">家政服务</text>
					<text class="sub-title">精选优质服务 · 准时到达</text>
				</view>
				
				<view class="service-grid">
					<view class="service-card" @click="goToCreateOrder('cleaning')">
						<view class="icon-box cleaning"></view>
						<text class="name">保洁服务</text>
					</view>
					<view class="service-card" @click="goToCreateOrder('repair')">
						<view class="icon-box repair"></view>
						<text class="name">维修服务</text>
					</view>
					<view class="service-card" @click="goToCreateOrder('cooking')">
						<view class="icon-box cooking"></view>
						<text class="name">做饭服务</text>
					</view>
					<view class="service-card" @click="goToCreateOrder('babysitting')">
						<view class="icon-box babysitting"></view>
						<text class="name">育儿服务</text>
					</view>
				</view>
				
				<view class="quick-entry" @click="goToOrderList">
					<view class="entry-left">
						<text class="iconfont icon-order"></text>
						<text class="label">我的订单管理</text>
					</view>
					<view class="entry-right">
						<text>立即查看</text>
						<text class="iconfont icon-arrow-right"></text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 服务员首页 -->
		<view v-else-if="userRole === 'worker'" class="home-wrapper">
			<view class="banner-section worker animate-slide-down">
				<view class="welcome-box">
					<text class="greet">接单员：{{ username }}</text>
					<text class="slogan">今日事今日毕，竭诚为您服务</text>
				</view>
			</view>
			
			<view class="content-body">
				<view class="stats-card">
					<view class="stats-title">工作概览</view>
					<view class="stats-grid">
						<view class="stat-node">
							<text class="num primary">{{ pendingCount }}</text>
							<text class="tag">待接单</text>
						</view>
						<view class="stat-node">
							<text class="num warning">{{ inProgressCount }}</text>
							<text class="tag">进行中</text>
						</view>
						<view class="stat-node">
							<text class="num gray">{{ completedCount }}</text>
							<text class="tag">已完成</text>
						</view>
					</view>
				</view>
				
				<button class="action-btn-styled" @click="goToOrderList">
					进入工作台
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import { getWorkerOrders } from '../../api/order'

export default {
	data() {
		return {
			userRole: '',
			userId: '',
			username: '',
			pendingCount: 0,
			inProgressCount: 0,
			completedCount: 0
		}
	},
	onLoad() {
		this.checkLogin()
	},
	onShow() {
		this.loadData()
	},
	onPullDownRefresh() {
		if (this.userRole === 'worker') {
			this.loadWorkerStats().finally(() => {
				uni.stopPullDownRefresh()
			})
		} else {
			uni.stopPullDownRefresh()
		}
	},
	methods: {
		checkLogin() {
			const token = uni.getStorageSync('token')
			if (!token) {
				uni.reLaunch({
					url: '/pages/login/login'
				})
				return
			}
			
			this.userRole = uni.getStorageSync('role')
			this.userId = uni.getStorageSync('userId')
			this.username = uni.getStorageSync('username') || '用户'
		},
		loadData() {
			if (this.userRole === 'worker') {
				this.loadWorkerStats()
			}
		},
		loadWorkerStats() {
			const promises = [
				getWorkerOrders(this.userId, 'PENDING').then(res => {
					if (res.code === 200) {
						this.pendingCount = res.data ? res.data.length : 0
					}
				}),
				getWorkerOrders(this.userId, 'IN_PROGRESS').then(res => {
					if (res.code === 200) {
						this.inProgressCount = res.data ? res.data.length : 0
					}
				}),
				getWorkerOrders(this.userId, 'COMPLETED').then(res => {
					if (res.code === 200) {
						this.completedCount = res.data ? res.data.length : 0
					}
				})
			]
			return Promise.all(promises)
		},
		goToCreateOrder(serviceType) {
			uni.navigateTo({
				url: `/pages/order/create?serviceType=${serviceType}`
			})
		},
		goToOrderList() {
			uni.switchTab({
				url: '/pages/order/list'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.index-container {
	min-height: 100vh;
	background: #f8fafc;
	position: relative;
}

.bg-header {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 400rpx;
	background: linear-gradient(180deg, #1890ff 0%, #f8fafc 100%);
	z-index: 0;
}

.home-wrapper {
	position: relative;
	z-index: 1;
	padding: 0 30rpx;
}

/* Banner */
.banner-section {
	padding: 60rpx 0;
	.welcome-box {
		.greet {
			display: block;
			font-size: 44rpx;
			font-weight: bold;
			color: #ffffff;
			margin-bottom: 12rpx;
		}
		.slogan {
			font-size: 26rpx;
			color: rgba(255,255,255,0.85);
		}
	}
}

.content-body {
	margin-top: 20rpx;
}

.section-header {
	margin-bottom: 30rpx;
	.title {
		font-size: 34rpx;
		font-weight: bold;
		color: #1a1a1a;
		margin-right: 16rpx;
	}
	.sub-title {
		font-size: 24rpx;
		color: #999;
	}
}

/* Service Grid */
.service-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 24rpx;
	margin-bottom: 40rpx;
}

.service-card {
	background: #ffffff;
	border-radius: 32rpx;
	padding: 40rpx 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.03);
	transition: all 0.3s;
	
	&:active {
		transform: scale(0.96);
		background: #f0f7ff;
	}
	
	.name {
		margin-top: 20rpx;
		font-size: 30rpx;
		color: #333;
		font-weight: 600;
	}
}

.icon-box {
	width: 90rpx;
	height: 90rpx;
	background-size: contain;
	background-repeat: no-repeat;
	
	&.cleaning { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M14.79 10.62L3.5 19.06c-1.17.88-1.21 2.63-.08 3.56.88.75 2.13.71 2.96-.08l10.29-9.82 1.5.89-.5 1.5 5 2.5 1.5-3 1-5-1.78-1.78-5.26 1.05-1.5 1.5-.9-1.5z"/></svg>'); }
	&.repair { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>'); }
	&.cooking { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M18 3c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-2zM2 13.88V20c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-6.12c0-1.28-.79-2.41-2.02-2.86l-2.98-1.09V5c0-1.1-.9-2-2-2-1.1 0-2 .9-2 2v4.93L4.02 11.02C2.79 11.47 2 12.6 2 13.88z"/></svg>'); }
	&.babysitting { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z"/></svg>'); }
}

/* Quick Entry */
.quick-entry {
	background: #ffffff;
	border-radius: 28rpx;
	padding: 34rpx 40rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.03);
	margin-bottom: 50rpx;
	
	.entry-left {
		display: flex;
		align-items: center;
		.label {
			font-size: 30rpx;
			color: #333;
			font-weight: 500;
		}
	}
	.entry-right {
		font-size: 24rpx;
		color: #1890ff;
		display: flex;
		align-items: center;
	}
}

/* Stats Card (Worker) */
.stats-card {
	background: #ffffff;
	border-radius: 36rpx;
	padding: 40rpx;
	box-shadow: 0 20rpx 50rpx rgba(0,0,0,0.04);
	margin-bottom: 40rpx;
	
	.stats-title {
		font-size: 30rpx;
		color: #1a1a1a;
		font-weight: bold;
		margin-bottom: 30rpx;
	}
}

.stats-grid {
	display: flex;
	justify-content: space-between;
}

.stat-node {
	text-align: center;
	flex: 1;
	.num {
		display: block;
		font-size: 52rpx;
		font-weight: 800;
		margin-bottom: 12rpx;
		
		&.primary { color: #1890ff; }
		&.warning { color: #faad14; }
		&.gray { color: #8c8c8c; }
	}
	.tag {
		font-size: 24rpx;
		color: #999;
	}
}

.action-btn-styled {
	width: 100%;
	height: 100rpx;
	line-height: 100rpx;
	background: linear-gradient(90deg, #1890ff, #36a3ff);
	color: #ffffff;
	border-radius: 50rpx;
	font-size: 32rpx;
	font-weight: bold;
	box-shadow: 0 16rpx 32rpx rgba(24, 144, 255, 0.2);
	border: none;
	
	&:active {
		transform: scale(0.98);
		box-shadow: 0 8rpx 16rpx rgba(24, 144, 255, 0.2);
	}
}

/* Animation */
@keyframes slideDown {
	from { opacity: 0; transform: translateY(-30rpx); }
	to { opacity: 1; transform: translateY(0); }
}

.animate-slide-down {
	animation: slideDown 0.6s ease-out;
}
</style>
