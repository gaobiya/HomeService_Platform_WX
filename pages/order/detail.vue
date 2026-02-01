<template>
	<view class="order-detail-page">
		<!-- 浸透式状态顶栏 -->
		<view class="status-header" :class="getStatusClass(order.status)" v-if="order">
			<view class="status-content animate-slide-down">
				<view class="status-text-box">
					<text class="status-name">{{ getStatusName(order.status) }}</text>
					<text class="status-desc">{{ getStatusDesc(order.status) }}</text>
				</view>
			</view>
		</view>

		<view class="detail-container" v-if="order">
			<!-- 核心信息卡片 -->
			<view class="info-card animate-slide-up">
				<view class="card-title">
					<text>订单基本信息</text>
				</view>
				<view class="info-list">
					<view class="info-item">
						<text class="label">订单编号</text>
						<text class="value">{{ order.id }}</text>
					</view>
					<view class="info-item">
						<text class="label">服务类型</text>
						<text class="value highlight">{{ getServiceTypeName(order.serviceType) }}</text>
					</view>
					<view class="info-item">
						<text class="label">订单金额</text>
						<text class="value price">¥{{ order.amount || '0.00' }}</text>
					</view>
					<view class="info-item">
						<text class="label">服务时间</text>
						<text class="value">{{ formatDateTime(order.serviceTime) }}</text>
					</view>
					<view class="info-item location">
						<text class="label">服务地址</text>
						<text class="value address-text">{{ order.address }}</text>
					</view>
				</view>
			</view>

			<!-- 需求备注卡片 -->
			<view class="info-card animate-slide-up" v-if="order.description">
				<view class="card-title">
					<text>服务详情备注</text>
				</view>
				<view class="memo-content">
					<text>{{ order.description }}</text>
				</view>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view class="fixed-footer animate-slide-up" v-if="order">
			<view class="action-container">
				<!-- 客户操作 -->
				<button 
					v-if="userRole === 'customer' && order.status === 'COMPLETED' && order.paid === 0"
					class="footer-btn primary-btn-styled"
					@click="goToPay"
				>
					立即支付 ¥{{ order.amount }}
				</button>
				<button 
					v-if="userRole === 'customer' && order.status === 'COMPLETED' && order.paid === 1 && !hasRated"
					class="footer-btn ghost-btn"
					@click="goToRating"
				>
					去评价服务
				</button>
				<view 
					v-if="userRole === 'customer' && order.status === 'COMPLETED' && order.paid === 1 && hasRated"
					class="footer-tip success"
				>
					<text>您已评价该订单</text>
				</view>

				<!-- 服务员：待接单时 接受+拒绝 一起 -->
				<view class="worker-actions" v-if="userRole === 'worker' && order.status === 'ASSIGNED' && order.workerId == userId">
					<button class="footer-btn danger-btn ghost" @click="handleReject">拒绝此单</button>
					<button class="footer-btn primary-btn-styled" @click="handleAccept">接受派单</button>
				</view>
				<!-- 服务员：进行中时 只显示完成 -->
				<view class="worker-actions" v-if="userRole === 'worker' && order.status === 'IN_PROGRESS' && order.workerId == userId">
					<button class="footer-btn primary-btn-styled" @click="handleComplete">完成服务</button>
				</view>

				<button 
					v-if="userRole === 'worker' && order.status === 'COMPLETED' && order.paid === 1 && order.workerId == userId && !hasRated"
					class="footer-btn primary-btn-styled"
					@click="goToRating"
				>
					评价客户
				</button>
				
				<view 
					v-if="userRole === 'worker' && order.status === 'COMPLETED' && order.paid === 1 && order.workerId == userId && hasRated"
					class="footer-tip success"
				>
					<text>已评价</text>
				</view>
				
				<view 
					v-if="userRole === 'worker' && order.status === 'COMPLETED' && order.paid === 0 && order.workerId == userId"
					class="footer-tip info"
				>
					<text>等待客户支付后评价</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getOrderDetail, completeOrder, rejectOrder, acceptOrder } from '../../api/order'
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
						this.checkRatingStatus()
					}
				})
		},
		checkRatingStatus() {
			if (this.order && this.order.status === 'COMPLETED' && this.userId) {
				getOrderRatings(this.orderId)
					.then(res => {
						if (res.code === 200) {
							const ratings = res.data || []
							this.hasRated = ratings.some(rating => rating.raterId === this.userId)
						}
					})
					.catch(err => {
						console.error('检查评价状态失败:', err)
					})
			}
		},
		handleAccept() {
			uni.showModal({
				title: '确认接单',
				content: '确定接受此派单？接受后将进入服务流程。',
				confirmColor: '#1890FF',
				success: (res) => {
					if (res.confirm) {
						acceptOrder(this.orderId, this.userId)
							.then(result => {
								if (result.code === 200) {
									uni.showToast({ title: '已接单', icon: 'success' })
									this.loadDetail()
								}
							})
							.catch(err => {
								uni.showToast({ title: err.message || '接单失败', icon: 'none' })
							})
					}
				}
			})
		},
		handleReject() {
			uni.showModal({
				title: '确认拒绝',
				content: '拒绝后订单将重新进入派单池。',
				confirmColor: '#FF4D4F',
				success: (res) => {
					if (res.confirm) {
						rejectOrder(this.orderId, this.userId)
							.then(result => {
								if (result.code === 200) {
									uni.showToast({ title: '已拒绝订单', icon: 'success' })
									setTimeout(() => { uni.navigateBack() }, 1500)
								}
							})
							.catch(err => {
								uni.showToast({ title: err.message || '拒绝失败', icon: 'none' })
							})
					}
				}
			})
		},
		handleComplete() {
			uni.showModal({
				title: '服务确认',
				content: '请确认您已完成该家政服务？',
				confirmColor: '#1890FF',
				success: (res) => {
					if (res.confirm) {
						completeOrder(this.orderId)
							.then(result => {
								if (result.code === 200) {
									uni.showToast({ title: '订单已完成', icon: 'success' })
									this.loadDetail()
								}
							})
					}
				}
			})
		},
		goToPay() {
			uni.navigateTo({ url: `/pages/order/pay?id=${this.orderId}` })
		},
		goToRating() {
			uni.navigateTo({ url: `/pages/order/rating?id=${this.orderId}` })
		},
		getServiceTypeName(type) {
			const map = {
				'cleaning': '精品保洁',
				'repair': '专业维修',
				'cooking': '爱心做饭',
				'babysitting': '育儿服务'
			}
			return map[type] || type
		},
		getStatusName(status) {
			const map = {
				'PENDING': '等待审核',
				'APPROVED': '待派单',
				'ASSIGNED': '待接单',
				'IN_PROGRESS': '服务进行中',
				'COMPLETED': '已完成',
				'CANCELLED': '已取消',
				'REJECTED': '已驳回'
			}
			return map[status] || status
		},
		getStatusDesc(status) {
			const map = {
				'PENDING': '您的订单已提交，请耐心等待管理员审核',
				'APPROVED': '订单已通过审核，正在火速为您匹配服务员',
				'ASSIGNED': '管理员已派单给您，请确认是否接受',
				'IN_PROGRESS': '服务员正在为您提供周到的家政服务',
				'COMPLETED': '订单已顺利完成，感谢您的信任',
				'CANCELLED': '该订单已被客户主动取消',
				'REJECTED': '您的需求不符合相关标准，已被管理员驳回'
			}
			return map[status] || '订单状态更新中'
		},
		getStatusClass(status) {
			const map = {
				'PENDING': 'pending',
				'APPROVED': 'approved',
				'ASSIGNED': 'approved',
				'IN_PROGRESS': 'active',
				'COMPLETED': 'success',
				'CANCELLED': 'cancel',
				'REJECTED': 'danger'
			}
			return map[status] || ''
		},
		formatDateTime(dateTime) {
			if (!dateTime) return '-'
			return new Date(dateTime).toLocaleString('zh-CN', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.order-detail-page {
	min-height: 100vh;
	background: #f4f7f9;
	padding-bottom: 200rpx;
}

/* 状态顶栏 */
.status-header {
	height: 320rpx;
	padding: 0 50rpx;
	display: flex;
	align-items: center;
	transition: all 0.3s;
	
	&.pending { background: linear-gradient(135deg, #faad14, #ffc53d); }
	&.active { background: linear-gradient(135deg, #1890ff, #40a9ff); }
	&.success { background: linear-gradient(135deg, #52c41a, #73d13d); }
	&.danger, &.cancel { background: linear-gradient(135deg, #ff4d4f, #ff7875); }
	&.approved { background: linear-gradient(135deg, #13c2c2, #36cfc9); }

	.status-content {
		display: flex;
		align-items: center;
		color: #fff;
	}

	.status-icon-box {
		width: 100rpx;
		height: 100rpx;
		background: rgba(255,255,255,0.2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
	}

	.status-icon {
		width: 50rpx;
		height: 50rpx;
		background-size: contain;
		background-repeat: no-repeat;
		
		&.PENDING { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>'); }
		&.IN_PROGRESS { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M13 12h7v1.5H13zm0-2.5h7V11h-7zm0 5h7V16h-7zM21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM3 19V6h16v13H3z"/></svg>'); }
		&.COMPLETED { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>'); }
	}

	.status-name {
		display: block;
		font-size: 40rpx;
		font-weight: bold;
		margin-bottom: 8rpx;
	}
	.status-desc {
		font-size: 24rpx;
		opacity: 0.9;
	}
}

/* 详情卡片容器 */
.detail-container {
	margin-top: -40rpx;
	padding: 0 30rpx;
}

.info-card {
	background: #fff;
	border-radius: 30rpx;
	padding: 40rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.02);
	
	.card-title {
		display: flex;
		align-items: center;
		font-size: 32rpx;
		color: #1a1a1a;
		font-weight: bold;
		margin-bottom: 30rpx;
		padding-left: 20rpx;
		border-left: 8rpx solid #1890ff;
		line-height: 1;
	}
}

.info-list {
	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
		
		&:last-child { border-bottom: none; }
		&.location { align-items: flex-start; }

		.item-left {
			display: flex;
			align-items: center;
			gap: 12rpx;
			.iconfont { font-size: 28rpx; color: #999; }
			.label { font-size: 26rpx; color: #8c8c8c; }
		}

		.value {
			font-size: 28rpx;
			color: #333;
			&.highlight { color: #1890ff; font-weight: 500; }
			&.price { color: #f5222d; font-weight: bold; font-size: 32rpx; }
			&.address-text { flex: 1; text-align: right; padding-left: 40rpx; line-height: 1.5; }
		}
	}
}

.memo-content {
	background: #f9fbff;
	padding: 30rpx;
	border-radius: 20rpx;
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
}

/* 底部操作 */
.fixed-footer {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	background: #fff;
	padding: 30rpx 40rpx calc(30rpx + env(safe-area-inset-bottom));
	box-shadow: 0 -10rpx 40rpx rgba(0,0,0,0.05);
	z-index: 100;
	box-sizing: border-box;
}

.action-container {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	width: 100%;
}

.worker-actions {
	display: flex;
	gap: 20rpx;
	.footer-btn { flex: 1; }
}

.footer-btn {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	border-radius: 45rpx;
	font-size: 30rpx;
	font-weight: bold;
	border: none;
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	
	&::after {
		border: none;
	}
	
	&.primary-btn-styled {
		background: linear-gradient(90deg, #1890ff, #40a9ff);
		color: #fff;
		box-shadow: 0 10rpx 20rpx rgba(24, 144, 255, 0.2);
	}
	
	&.ghost-btn {
		background: #fff;
		color: #1890ff;
		border: 2rpx solid #1890ff;
	}
	
	&.danger-btn.ghost {
		background: #fff;
		color: #ff4d4f;
		border: 2rpx solid #ff4d4f;
	}
}

.footer-tip {
	text-align: center;
	font-size: 26rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	padding: 10rpx 0;
	
	&.success { color: #52c41a; }
	&.info { color: #8c8c8c; }
}

/* 动画库 */
@keyframes slideDown {
	from { opacity: 0; transform: translateY(-40rpx); }
	to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
	from { opacity: 0; transform: translateY(40rpx); }
	to { opacity: 1; transform: translateY(0); }
}

.animate-slide-down { animation: slideDown 0.5s ease-out; }
.animate-slide-up { animation: slideUp 0.6s ease-out; }

.iconfont {
	font-size: 32rpx;
}
</style>
