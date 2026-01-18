<template>
	<view class="container">
		<view class="tabs">
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'schedule' }"
				@click="switchTab('schedule')"
			>
				可服务时间
			</view>
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'orders' }"
				@click="switchTab('orders')"
			>
				已安排订单
			</view>
		</view>
		
		<!-- 可服务时间 -->
		<view class="tab-content" v-if="currentTab === 'schedule'">
			<view class="add-form">
				<view class="form-item">
					<text class="label">日期</text>
					<picker mode="date" :value="form.date" @change="onDateChange">
						<view class="picker-value">{{ form.date || '请选择日期' }}</view>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">开始时间</text>
					<picker mode="time" :value="form.startTime" @change="onStartTimeChange">
						<view class="picker-value">{{ form.startTime || '请选择开始时间' }}</view>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">结束时间</text>
					<picker mode="time" :value="form.endTime" @change="onEndTimeChange">
						<view class="picker-value">{{ form.endTime || '请选择结束时间' }}</view>
					</picker>
				</view>
				<button class="add-btn" @click="addSchedule" :disabled="adding">
					{{ adding ? '添加中...' : '添加时间段' }}
				</button>
			</view>
			
			<view class="schedule-list">
				<view class="loading" v-if="loading">
					<text>加载中...</text>
				</view>
				<view 
					class="schedule-item" 
					v-for="item in schedules" 
					:key="item.id"
					v-else
				>
					<view class="schedule-info">
						<text class="schedule-time">{{ formatScheduleTime(item) }}</text>
					</view>
					<button class="delete-btn" @click="deleteSchedule(item.id)">删除</button>
				</view>
				<view class="empty" v-if="!loading && schedules.length === 0">
					<text>暂无可服务时间段</text>
					<text class="empty-tip">点击上方表单添加可服务时间段</text>
				</view>
			</view>
		</view>
		
		<!-- 已安排订单 -->
		<view class="tab-content" v-if="currentTab === 'orders'">
			<view class="order-list">
				<view class="loading" v-if="loading">
					<text>加载中...</text>
				</view>
				<view 
					class="order-item" 
					v-for="order in orders" 
					:key="order.id"
					@click="goToOrderDetail(order.id)"
					v-else
				>
					<view class="order-info">
						<text class="order-type">{{ getServiceTypeName(order.serviceType) }}</text>
						<text class="order-time">{{ formatDateTime(order.serviceTime) }}</text>
						<text class="order-address">{{ order.address }}</text>
					</view>
					<text class="order-status">{{ getStatusName(order.status) }}</text>
				</view>
				<view class="empty" v-if="!loading && orders.length === 0">
					<text>暂无已安排订单</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { addSchedule, deleteSchedule, getWorkerSchedules, getWorkerScheduledOrders } from '../../api/schedule'

export default {
		data() {
			return {
				userId: 0,
				currentTab: 'schedule',
				form: {
					date: '',
					startTime: '',
					endTime: ''
				},
				schedules: [],
				orders: [],
				adding: false,
				loading: false
			}
		},
	onLoad() {
		this.userId = parseInt(uni.getStorageSync('userId')) || 0
		if (!this.userId) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/login/login'
				})
			}, 1500)
			return
		}
		this.loadSchedules()
	},
	onShow() {
		if (this.currentTab === 'schedule') {
			this.loadSchedules()
		} else {
			this.loadOrders()
		}
	},
	methods: {
		switchTab(tab) {
			this.currentTab = tab
			if (tab === 'schedule') {
				this.loadSchedules()
			} else {
				this.loadOrders()
			}
		},
		onDateChange(e) {
			this.form.date = e.detail.value
		},
		onStartTimeChange(e) {
			this.form.startTime = e.detail.value
		},
		onEndTimeChange(e) {
			this.form.endTime = e.detail.value
		},
		addSchedule() {
			if (!this.form.date || !this.form.startTime || !this.form.endTime) {
				uni.showToast({
					title: '请填写完整信息',
					icon: 'none'
				})
				return
			}
			
			const startTime = `${this.form.date} ${this.form.startTime}:00`
			const endTime = `${this.form.date} ${this.form.endTime}:00`
			
			if (endTime <= startTime) {
				uni.showToast({
					title: '结束时间必须晚于开始时间',
					icon: 'none'
				})
				return
			}
			
			this.adding = true
			addSchedule(this.userId, startTime, endTime)
				.then(res => {
					if (res.code === 200) {
						uni.showToast({
							title: '添加成功',
							icon: 'success'
						})
						this.form = {
							date: '',
							startTime: '',
							endTime: ''
						}
						this.loadSchedules()
					}
				})
				.catch(err => {
					console.error('添加失败:', err)
					uni.showToast({
						title: err.message || '添加失败',
						icon: 'none'
					})
				})
				.finally(() => {
					this.adding = false
				})
		},
		deleteSchedule(scheduleId) {
			uni.showModal({
				title: '提示',
				content: '确定要删除此时间段吗？',
				success: (res) => {
					if (res.confirm) {
						deleteSchedule(scheduleId, this.userId)
							.then(result => {
								if (result.code === 200) {
									uni.showToast({
										title: '删除成功',
										icon: 'success'
									})
									this.loadSchedules()
								}
							})
							.catch(err => {
								console.error('删除失败:', err)
								uni.showToast({
									title: err.message || '删除失败',
									icon: 'none'
								})
							})
					}
				}
			})
		},
		loadSchedules() {
			this.loading = true
			getWorkerSchedules(this.userId)
				.then(res => {
					if (res.code === 200) {
						this.schedules = res.data || []
					}
				})
				.catch(err => {
					console.error('加载日程失败:', err)
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					})
				})
				.finally(() => {
					this.loading = false
				})
		},
		loadOrders() {
			this.loading = true
			getWorkerScheduledOrders(this.userId)
				.then(res => {
					if (res.code === 200) {
						this.orders = res.data || []
					}
				})
				.catch(err => {
					console.error('加载订单失败:', err)
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					})
				})
				.finally(() => {
					this.loading = false
				})
		},
		formatScheduleTime(schedule) {
			const start = this.formatDateTime(schedule.startTime)
			const end = this.formatDateTime(schedule.endTime)
			return `${start} - ${end}`
		},
		formatDateTime(dateTime) {
			if (!dateTime) return ''
			const date = new Date(dateTime)
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const hours = String(date.getHours()).padStart(2, '0')
			const minutes = String(date.getMinutes()).padStart(2, '0')
			return `${year}-${month}-${day} ${hours}:${minutes}`
		},
		getServiceTypeName(type) {
			const map = {
				'cleaning': '保洁服务',
				'repair': '维修服务',
				'cooking': '做饭服务',
				'babysitting': '育儿服务'
			}
			return map[type] || type
		},
		getStatusName(status) {
			const map = {
				'PENDING': '待审核',
				'APPROVED': '已审核待派单',
				'IN_PROGRESS': '进行中',
				'COMPLETED': '已完成',
				'CANCELLED': '已取消'
			}
			return map[status] || status
		},
		goToOrderDetail(orderId) {
			uni.navigateTo({
				url: `/pages/order/detail?id=${orderId}`
			})
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background-color: #F5F5F5;
}

.tabs {
	display: flex;
	background-color: #fff;
	border-bottom: 1rpx solid #E0E0E0;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 30rpx 0;
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
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 60rpx;
	height: 4rpx;
	background-color: #1890FF;
}

.tab-content {
	padding: 20rpx;
}

.add-form {
	background-color: #fff;
	border-radius: 10rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
}

.form-item {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}

.label {
	width: 160rpx;
	font-size: 28rpx;
	color: #333;
}

.picker-value {
	flex: 1;
	font-size: 28rpx;
	color: #666;
	padding: 20rpx;
	background-color: #F5F5F5;
	border-radius: 8rpx;
}

.add-btn {
	width: 100%;
	height: 88rpx;
	background-color: #1890FF;
	color: #fff;
	border-radius: 10rpx;
	font-size: 32rpx;
	line-height: 88rpx;
	text-align: center;
	border: none;
	margin-top: 20rpx;
}

.add-btn[disabled] {
	background-color: #ccc;
}

.schedule-list {
	background-color: #fff;
	border-radius: 10rpx;
	overflow: hidden;
}

.schedule-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 20rpx;
	border-bottom: 1rpx solid #F0F0F0;
}

.schedule-item:last-child {
	border-bottom: none;
}

.schedule-info {
	flex: 1;
}

.schedule-time {
	font-size: 28rpx;
	color: #333;
}

.delete-btn {
	padding: 10rpx 20rpx;
	background-color: #FF4D4F;
	color: #fff;
	border-radius: 8rpx;
	font-size: 24rpx;
	border: none;
}

.order-list {
	background-color: #fff;
	border-radius: 10rpx;
	overflow: hidden;
}

.order-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 20rpx;
	border-bottom: 1rpx solid #F0F0F0;
}

.order-item:last-child {
	border-bottom: none;
}

.order-info {
	flex: 1;
}

.order-type {
	display: block;
	font-size: 32rpx;
	color: #333;
	font-weight: bold;
	margin-bottom: 10rpx;
}

.order-time {
	display: block;
	font-size: 26rpx;
	color: #666;
	margin-bottom: 8rpx;
}

.order-address {
	display: block;
	font-size: 26rpx;
	color: #999;
}

.order-status {
	font-size: 26rpx;
	color: #1890FF;
}

.empty {
	text-align: center;
	padding: 100rpx 0;
	color: #999;
	font-size: 28rpx;
}

.empty-tip {
	display: block;
	margin-top: 20rpx;
	font-size: 24rpx;
	color: #ccc;
}

.loading {
	text-align: center;
	padding: 100rpx 0;
	color: #999;
	font-size: 28rpx;
}
</style>
