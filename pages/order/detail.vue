<template>
	<view class="order-detail">
		<view class="detail-card" v-if="order">
			<view class="section">
				<text class="label">订单号</text>
				<text class="value">{{ order.id }}</text>
			</view>
			<view class="section">
				<text class="label">服务类型</text>
				<text class="value">{{ getServiceTypeName(order.serviceType) }}</text>
			</view>
			<view class="section">
				<text class="label">服务地址</text>
				<text class="value">{{ order.address }}</text>
			</view>
			<view class="section">
				<text class="label">服务时间</text>
				<text class="value">{{ formatDateTime(order.serviceTime) }}</text>
			</view>
			<view class="section">
				<text class="label">订单状态</text>
				<text class="value status" :class="getStatusClass(order.status)">
					{{ getStatusName(order.status) }}
				</text>
			</view>
			<view class="section" v-if="order.description">
				<text class="label">服务说明</text>
				<text class="value">{{ order.description }}</text>
			</view>
		</view>
		
		<view class="actions" v-if="order">
			<button 
				v-if="userRole === 'customer' && order.status === 'COMPLETED' && order.paid === 0"
				class="action-btn primary"
				@click="goToPay"
			>
				立即支付
			</button>
			<button 
				v-if="userRole === 'customer' && order.status === 'COMPLETED' && order.paid === 1 && !hasRated"
				class="action-btn"
				@click="goToRating"
			>
				评价服务
			</button>
			<view 
				v-if="userRole === 'customer' && order.status === 'COMPLETED' && order.paid === 1 && hasRated"
				class="rated-tip"
			>
				<text>已评价</text>
			</view>
			<button 
				v-if="userRole === 'worker' && order.status === 'IN_PROGRESS' && order.workerId == userId"
				class="action-btn reject-btn"
				@click="handleReject"
			>
				拒绝订单
			</button>
			<button 
				v-if="userRole === 'worker' && order.status === 'IN_PROGRESS' && order.workerId == userId"
				class="action-btn primary"
				@click="handleComplete"
			>
				完成服务
			</button>
			<button 
				v-if="userRole === 'worker' && order.status === 'COMPLETED' && order.paid === 1 && order.workerId == userId && !hasRated"
				class="action-btn"
				@click="goToRating"
			>
				评价客户
			</button>
			<view 
				v-if="userRole === 'worker' && order.status === 'COMPLETED' && order.paid === 1 && order.workerId == userId && hasRated"
				class="rated-tip"
			>
				<text>已评价</text>
			</view>
			<view 
				v-if="userRole === 'worker' && order.status === 'COMPLETED' && order.paid === 0 && order.workerId == userId"
				class="waiting-tip"
			>
				<text>等待客户支付后即可评价</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getOrderDetail, completeOrder, rejectOrder } from '../../api/order'
import { getOrderRatings } from '../../api/rating'

export default {
	data() {
		return {
			order: null,
			orderId: '',
			userRole: '',
			userId: 0,
			hasRated: false
		}
	},
	onLoad(options) {
		this.orderId = options.id
		this.userRole = uni.getStorageSync('role')
		this.userId = parseInt(uni.getStorageSync('userId')) || 0
		this.loadDetail()
	},
	onShow() {
		// 页面显示时重新加载订单数据（支付完成后返回时刷新）
		if (this.orderId) {
			this.loadDetail()
		}
	},
	methods: {
		loadDetail() {
			getOrderDetail(this.orderId)
				.then(res => {
					if (res.code === 200) {
						this.order = res.data
						// 检查是否已评价
						this.checkRatingStatus()
					}
				})
		},
		checkRatingStatus() {
			// 只有订单已完成时才检查评价状态
			if (this.order && this.order.status === 'COMPLETED' && this.userId) {
				getOrderRatings(this.orderId)
					.then(res => {
						if (res.code === 200) {
							const ratings = res.data || []
							// 检查当前用户是否已经评价过
							this.hasRated = ratings.some(rating => rating.raterId === this.userId)
						}
					})
					.catch(err => {
						console.error('检查评价状态失败:', err)
					})
			}
		},
		handleReject() {
			uni.showModal({
				title: '确认拒绝',
				content: '确定要拒绝此订单吗？拒绝后订单将重新进入派单池。',
				success: (res) => {
					if (res.confirm) {
						rejectOrder(this.orderId, this.userId)
							.then(result => {
								if (result.code === 200) {
									uni.showToast({
										title: '已拒绝订单',
										icon: 'success'
									})
									setTimeout(() => {
										uni.navigateBack()
									}, 1500)
								}
							})
							.catch(err => {
								console.error('拒绝订单失败:', err)
								uni.showToast({
									title: err.message || '拒绝失败',
									icon: 'none'
								})
							})
					}
				}
			})
		},
		handleComplete() {
			uni.showModal({
				title: '确认',
				content: '确定完成此订单？',
				success: (res) => {
					if (res.confirm) {
						completeOrder(this.orderId)
							.then(result => {
								if (result.code === 200) {
									uni.showToast({
										title: '订单已完成',
										icon: 'success'
									})
									this.loadDetail()
								}
							})
					}
				}
			})
		},
		goToPay() {
			uni.navigateTo({
				url: `/pages/order/pay?id=${this.orderId}`
			})
		},
		goToRating() {
			uni.navigateTo({
				url: `/pages/order/rating?id=${this.orderId}`
			})
		},
		getServiceTypeName(type) {
			const map = {
				'cleaning': '保洁',
				'repair': '维修',
				'cooking': '做饭',
				'babysitting': '育儿'
			}
			return map[type] || type
		},
		getStatusName(status) {
			const map = {
				'PENDING': '待审核',
				'APPROVED': '已审核待派单',
				'IN_PROGRESS': '进行中',
				'COMPLETED': '已完成',
				'CANCELLED': '已取消',
				'REJECTED': '已驳回'
			}
			return map[status] || status
		},
		getStatusClass(status) {
			const map = {
				'PENDING': 'warning',
				'APPROVED': 'info',
				'IN_PROGRESS': 'primary',
				'COMPLETED': 'success',
				'CANCELLED': 'info',
				'REJECTED': 'danger'
			}
			return map[status] || ''
		},
		formatDateTime(dateTime) {
			if (!dateTime) return ''
			return new Date(dateTime).toLocaleString('zh-CN')
		}
	}
}
</script>

<style scoped>
.order-detail {
	min-height: 100vh;
	background: #F5F5F5;
	padding: 20rpx;
}

.detail-card {
	background: #fff;
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 20rpx;
}

.section {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 30rpx;
	padding-bottom: 30rpx;
	border-bottom: 2rpx solid #F0F0F0;
}

.section:last-child {
	border-bottom: none;
	margin-bottom: 0;
	padding-bottom: 0;
}

.label {
	font-size: 28rpx;
	color: #999;
	width: 150rpx;
}

.value {
	flex: 1;
	font-size: 28rpx;
	color: #333;
	text-align: right;
}

.value.status.warning {
	color: #FA8C16;
}

.value.status.primary {
	color: #1890FF;
}

.value.status.success {
	color: #52C41A;
}

.value.status.info {
	color: #999;
}

.value.status.danger {
	color: #FF4D4F;
}

.actions {
	padding: 20rpx;
	display: flex;
	gap: 20rpx;
}

.action-btn {
	flex: 1;
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

.action-btn.reject-btn {
	background: #FF4D4F;
}

.waiting-tip {
	text-align: center;
	padding: 20rpx 0;
	color: #999;
	font-size: 24rpx;
}

.rated-tip {
	text-align: center;
	padding: 20rpx 0;
	color: #52C41A;
	font-size: 28rpx;
	font-weight: 500;
}
</style>
