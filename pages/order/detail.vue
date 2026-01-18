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
				v-if="userRole === 'customer' && order.status === 'COMPLETED' && order.paid === 1"
				class="action-btn"
				@click="goToRating"
			>
				评价服务
			</button>
			<button 
				v-if="userRole === 'worker' && order.status === 'IN_PROGRESS'"
				class="action-btn primary"
				@click="handleComplete"
			>
				完成服务
			</button>
		</view>
	</view>
</template>

<script>
import { getOrderDetail, completeOrder } from '../../api/order'

export default {
	data() {
		return {
			order: null,
			orderId: '',
			userRole: ''
		}
	},
	onLoad(options) {
		this.orderId = options.id
		this.userRole = uni.getStorageSync('role')
		this.loadDetail()
	},
	methods: {
		loadDetail() {
			getOrderDetail(this.orderId)
				.then(res => {
					if (res.code === 200) {
						this.order = res.data
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
				'IN_PROGRESS': '进行中',
				'COMPLETED': '已完成',
				'CANCELLED': '已取消'
			}
			return map[status] || status
		},
		getStatusClass(status) {
			const map = {
				'PENDING': 'warning',
				'IN_PROGRESS': 'primary',
				'COMPLETED': 'success',
				'CANCELLED': 'info'
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

.actions {
	padding: 20rpx;
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
	margin-bottom: 20rpx;
}

.action-btn.primary {
	background: #1890FF;
}
</style>
