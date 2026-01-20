<template>
	<view class="order-list">
		<view class="tabs">
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'all' }"
				@click="switchTab('all')"
			>
				全部
			</view>
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'PENDING' }"
				@click="switchTab('PENDING')"
			>
				待处理
			</view>
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'IN_PROGRESS' }"
				@click="switchTab('IN_PROGRESS')"
			>
				进行中
			</view>
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'COMPLETED' }"
				@click="switchTab('COMPLETED')"
			>
				已完成
			</view>
		</view>
		
		<view class="order-items">
			<view 
				class="order-item" 
				v-for="order in orderList" 
				:key="order.id"
				@click="goToDetail(order.id)"
			>
				<view class="order-header">
					<text class="order-id">订单号：{{ order.id }}</text>
					<text class="status" :class="getStatusClass(order.status)">
						{{ getStatusName(order.status) }}
					</text>
				</view>
				<view class="order-content">
					<text class="service-type">{{ getServiceTypeName(order.serviceType) }}</text>
					<text class="address">{{ order.address }}</text>
					<text class="time">{{ formatDateTime(order.serviceTime) }}</text>
				</view>
				<view class="order-actions" v-if="userRole === 'worker' && order.workerId == userId">
					<button 
						v-if="order.status === 'IN_PROGRESS'"
						class="action-btn reject-btn" 
						@click.stop="handleReject(order.id)"
					>
						拒绝订单
					</button>
					<button 
						v-if="order.status === 'IN_PROGRESS'"
						class="action-btn" 
						@click.stop="handleComplete(order.id)"
					>
						完成服务
					</button>
					<button 
						v-if="order.status === 'COMPLETED' && order.paid === 1 && !order.hasRated"
						class="action-btn" 
						@click.stop="goToRating(order.id)"
					>
						评价客户
					</button>
					<view 
						v-if="order.status === 'COMPLETED' && order.paid === 1 && order.hasRated"
						class="rated-tip"
					>
						<text>已评价</text>
					</view>
					<view 
						v-if="order.status === 'COMPLETED' && order.paid === 0"
						class="waiting-tip"
					>
						<text>等待客户支付</text>
					</view>
				</view>
			</view>
			
			<view v-if="orderList.length === 0" class="empty">
				<text>暂无订单</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getCustomerOrders, getWorkerOrders, getCustomerOrdersPage, getWorkerOrdersPage, completeOrder, rejectOrder } from '../../api/order'
import { getOrderRatings } from '../../api/rating'

export default {
		data() {
			return {
				currentTab: 'all',
				orderList: [],
				userRole: '',
				userId: 0,
				pageNum: 1,
				pageSize: 10,
				total: 0,
				hasMore: true,
				loading: false
			}
		},
		onLoad() {
			this.userRole = uni.getStorageSync('role')
			this.userId = parseInt(uni.getStorageSync('userId')) || 0
		this.loadOrders()
	},
	onShow() {
		this.loadOrders()
	},
		onPullDownRefresh() {
			// 下拉刷新
			this.pageNum = 1
			this.hasMore = true
			this.orderList = []
			this.loadOrders().finally(() => {
				uni.stopPullDownRefresh()
			})
		},
		onReachBottom() {
			// 上拉加载更多
			if (this.hasMore && !this.loading) {
				this.loadMore()
			}
		},
	methods: {
		switchTab(tab) {
			this.currentTab = tab
			this.loadOrders()
		},
		loadOrders() {
			if (this.loading) return Promise.resolve()
			this.loading = true
			this.pageNum = 1
			this.hasMore = true
			const status = this.currentTab === 'all' ? null : this.currentTab
			
			if (this.userRole === 'customer') {
				return getCustomerOrdersPage(this.userId, status, this.pageNum, this.pageSize)
					.then(res => {
						if (res.code === 200 && res.data) {
							this.orderList = res.data.records || []
							this.total = res.data.total || 0
							this.hasMore = this.orderList.length < this.total
							// 检查每个订单的评价状态
							this.checkRatingsForOrders()
						}
					})
					.catch(err => {
						console.error('加载订单失败:', err)
					})
					.finally(() => {
						this.loading = false
					})
			} else if (this.userRole === 'worker') {
				return getWorkerOrdersPage(this.userId, status, this.pageNum, this.pageSize)
					.then(res => {
						if (res.code === 200 && res.data) {
							this.orderList = res.data.records || []
							this.total = res.data.total || 0
							this.hasMore = this.orderList.length < this.total
							// 检查每个订单的评价状态
							this.checkRatingsForOrders()
						}
					})
					.catch(err => {
						console.error('加载订单失败:', err)
					})
					.finally(() => {
						this.loading = false
					})
			}
			return Promise.resolve()
		},
		loadMore() {
			if (this.loading || !this.hasMore) return
			this.loading = true
			this.pageNum++
			const status = this.currentTab === 'all' ? null : this.currentTab
			
			if (this.userRole === 'customer') {
				getCustomerOrdersPage(this.userId, status, this.pageNum, this.pageSize)
					.then(res => {
						if (res.code === 200 && res.data) {
							const newOrders = res.data.records || []
							this.orderList = [...this.orderList, ...newOrders]
							this.hasMore = this.orderList.length < res.data.total
							// 检查新订单的评价状态
							this.checkRatingsForOrders()
						}
					})
					.catch(err => {
						console.error('加载更多订单失败:', err)
						this.pageNum-- // 失败时回退页码
					})
					.finally(() => {
						this.loading = false
					})
			} else if (this.userRole === 'worker') {
				getWorkerOrdersPage(this.userId, status, this.pageNum, this.pageSize)
					.then(res => {
						if (res.code === 200 && res.data) {
							const newOrders = res.data.records || []
							this.orderList = [...this.orderList, ...newOrders]
							this.hasMore = this.orderList.length < res.data.total
							// 检查新订单的评价状态
							this.checkRatingsForOrders()
						}
					})
					.catch(err => {
						console.error('加载更多订单失败:', err)
						this.pageNum-- // 失败时回退页码
					})
					.finally(() => {
						this.loading = false
					})
			}
		},
		goToDetail(orderId) {
			uni.navigateTo({
				url: `/pages/order/detail?id=${orderId}`
			})
		},
		goToRating(orderId) {
			uni.navigateTo({
				url: `/pages/order/rating?id=${orderId}`
			})
		},
		handleReject(orderId) {
			uni.showModal({
				title: '确认拒绝',
				content: '确定要拒绝此订单吗？拒绝后订单将重新进入派单池。',
				success: (res) => {
					if (res.confirm) {
						rejectOrder(orderId, this.userId)
							.then(result => {
								if (result.code === 200) {
									uni.showToast({
										title: '已拒绝订单',
										icon: 'success'
									})
									this.loadOrders()
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
		handleComplete(orderId) {
			uni.showModal({
				title: '确认',
				content: '确定完成此订单？',
				success: (res) => {
					if (res.confirm) {
						completeOrder(orderId)
							.then(result => {
								if (result.code === 200) {
									uni.showToast({
										title: '订单已完成',
										icon: 'success'
									})
									this.loadOrders()
								}
							})
					}
				}
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
		},
		checkRatingsForOrders() {
			// 为每个已完成的订单检查评价状态
			const completedOrders = this.orderList.filter(order => 
				order.status === 'COMPLETED' && order.paid === 1
			)
			
			if (completedOrders.length === 0) {
				return
			}
			
			// 批量检查评价状态
			const checkPromises = completedOrders.map(order => {
				return getOrderRatings(order.id)
					.then(res => {
						if (res.code === 200) {
							const ratings = res.data || []
							// 检查当前用户是否已经评价过
							const hasRated = ratings.some(rating => rating.raterId === this.userId)
							// 使用 Vue.set 或直接赋值来更新响应式数据
							this.$set(order, 'hasRated', hasRated)
						}
					})
					.catch(err => {
						console.error(`检查订单${order.id}评价状态失败:`, err)
					})
			})
			
			Promise.all(checkPromises)
		}
	}
}
</script>

<style scoped>
.order-list {
	min-height: 100vh;
	background: #F5F5F5;
}

.tabs {
	display: flex;
	background: #fff;
	padding: 20rpx 0;
}

.tab-item {
	flex: 1;
	text-align: center;
	font-size: 28rpx;
	color: #666;
	padding: 20rpx 0;
}

.tab-item.active {
	color: #1890FF;
	border-bottom: 4rpx solid #1890FF;
}

.order-items {
	padding: 20rpx;
}

.order-item {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
}

.order-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.order-id {
	font-size: 24rpx;
	color: #999;
}

.status {
	font-size: 26rpx;
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
}

.status.warning {
	background: #FFF7E6;
	color: #FA8C16;
}

.status.primary {
	background: #E6F7FF;
	color: #1890FF;
}

.status.success {
	background: #F6FFED;
	color: #52C41A;
}

.status.info {
	background: #F0F0F0;
	color: #999;
}

.status.danger {
	background: #FFF1F0;
	color: #FF4D4F;
}

.order-content {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.service-type {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.address {
	font-size: 28rpx;
	color: #666;
}

.time {
	font-size: 24rpx;
	color: #999;
}

.order-actions {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 2rpx solid #F0F0F0;
}

.order-actions {
	display: flex;
	gap: 20rpx;
}

.action-btn {
	flex: 1;
	height: 70rpx;
	line-height: 70rpx;
	background: #1890FF;
	color: #fff;
	border-radius: 10rpx;
	font-size: 28rpx;
	border: none;
}

.action-btn.reject-btn {
	background: #FF4D4F;
}

.empty {
	text-align: center;
	padding: 100rpx 0;
	color: #999;
	font-size: 28rpx;
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
	font-size: 24rpx;
	font-weight: 500;
}

.loading-more, .no-more {
	text-align: center;
	padding: 30rpx 0;
	color: #999;
	font-size: 24rpx;
}
</style>
