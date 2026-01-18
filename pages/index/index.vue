<template>
	<view class="index-container">
		<!-- 客户首页 -->
		<view v-if="userRole === 'customer'" class="customer-home">
			<view class="banner">
				<text class="welcome">欢迎使用家政服务预约平台</text>
			</view>
			
			<view class="service-types">
				<view class="service-item" @click="goToCreateOrder('cleaning')">
					<text class="icon">🧹</text>
					<text class="name">保洁服务</text>
				</view>
				<view class="service-item" @click="goToCreateOrder('repair')">
					<text class="icon">🔧</text>
					<text class="name">维修服务</text>
				</view>
				<view class="service-item" @click="goToCreateOrder('cooking')">
					<text class="icon">🍳</text>
					<text class="name">做饭服务</text>
				</view>
				<view class="service-item" @click="goToCreateOrder('babysitting')">
					<text class="icon">👶</text>
					<text class="name">育儿服务</text>
				</view>
			</view>
			
			<view class="quick-actions">
				<button class="action-btn" @click="goToOrderList">我的订单</button>
			</view>
		</view>
		
		<!-- 服务员首页 -->
		<view v-else-if="userRole === 'worker'" class="worker-home">
			<view class="banner">
				<text class="welcome">欢迎，{{ username }}</text>
			</view>
			
			<view class="stats">
				<view class="stat-item">
					<text class="number">{{ pendingCount }}</text>
					<text class="label">待接单</text>
				</view>
				<view class="stat-item">
					<text class="number">{{ inProgressCount }}</text>
					<text class="label">进行中</text>
				</view>
				<view class="stat-item">
					<text class="number">{{ completedCount }}</text>
					<text class="label">已完成</text>
				</view>
			</view>
			
			<view class="quick-actions">
				<button class="action-btn primary" @click="goToOrderList">查看订单</button>
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
			
			if (this.userRole === 'worker') {
				this.loadWorkerStats()
			}
		},
		loadData() {
			if (this.userRole === 'worker') {
				this.loadWorkerStats()
			}
		},
		loadWorkerStats() {
			getWorkerOrders(this.userId, 'PENDING')
				.then(res => {
					if (res.code === 200) {
						this.pendingCount = res.data ? res.data.length : 0
					}
				})
			
			getWorkerOrders(this.userId, 'IN_PROGRESS')
				.then(res => {
					if (res.code === 200) {
						this.inProgressCount = res.data ? res.data.length : 0
					}
				})
			
			getWorkerOrders(this.userId, 'COMPLETED')
				.then(res => {
					if (res.code === 200) {
						this.completedCount = res.data ? res.data.length : 0
					}
				})
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

<style scoped>
.index-container {
	min-height: 100vh;
	background: #F5F5F5;
}

.banner {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 60rpx 40rpx;
	color: #fff;
}

.welcome {
	font-size: 36rpx;
	font-weight: bold;
}

.service-types {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
	padding: 40rpx;
}

.service-item {
	background: #fff;
	border-radius: 20rpx;
	padding: 40rpx;
	text-align: center;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.icon {
	font-size: 60rpx;
	display: block;
	margin-bottom: 20rpx;
}

.name {
	font-size: 28rpx;
	color: #333;
}

.quick-actions {
	padding: 40rpx;
}

.action-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background: #1890FF;
	color: #fff;
	border-radius: 10rpx;
	font-size: 32rpx;
	border: none;
}

.action-btn.primary {
	background: #1890FF;
}

.stats {
	display: flex;
	justify-content: space-around;
	padding: 40rpx;
	background: #fff;
	margin: 20rpx;
	border-radius: 20rpx;
}

.stat-item {
	text-align: center;
}

.number {
	display: block;
	font-size: 48rpx;
	font-weight: bold;
	color: #1890FF;
	margin-bottom: 10rpx;
}

.label {
	font-size: 24rpx;
	color: #666;
}
</style>
