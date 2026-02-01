<template>
	<view class="schedule-page">
		<!-- 沉浸式顶部 -->
		<view class="header-section">
			<view class="header-content animate-slide-down">
				<text class="page-title">日程助手</text>
				<text class="page-desc">合理安排时间，高效接单服务</text>
			</view>
			<!-- 现代标签切换 -->
			<view class="modern-tabs">
				<view 
					class="tab-item" 
					:class="{ active: currentTab === 'schedule' }"
					@click="switchTab('schedule')"
				>
					<text class="tab-text">可服务时间</text>
					<view class="tab-line" v-if="currentTab === 'schedule'"></view>
				</view>
				<view 
					class="tab-item" 
					:class="{ active: currentTab === 'orders' }"
					@click="switchTab('orders')"
				>
					<text class="tab-text">已安排订单</text>
					<view class="tab-line" v-if="currentTab === 'orders'"></view>
				</view>
			</view>
		</view>
		
		<view class="content-body">
			<!-- 可服务时间 -->
			<view class="tab-content" v-if="currentTab === 'schedule'">
				<!-- 添加表单卡片 -->
				<view class="glass-card add-form animate-slide-up">
					<view class="card-title">
						<text>新增服务时段</text>
					</view>
					<view class="form-group">
						<view class="form-row">
							<view class="field-label">
								<text>服务日期</text>
							</view>
							<picker mode="date" :value="form.date" @change="onDateChange">
								<view class="picker-box" :class="{ 'has-value': form.date }">
									{{ form.date || '请选择日期' }}
								</view>
							</picker>
						</view>
						<view class="form-grid">
							<view class="form-row half">
								<view class="field-label">
									<text>起始时间</text>
								</view>
								<picker mode="time" :value="form.startTime" @change="onStartTimeChange">
									<view class="picker-box" :class="{ 'has-value': form.startTime }">
										{{ form.startTime || '00:00' }}
									</view>
								</picker>
							</view>
							<view class="form-row half">
								<view class="field-label">
									<text>结束时间</text>
								</view>
								<picker mode="time" :value="form.endTime" @change="onEndTimeChange">
									<view class="picker-box" :class="{ 'has-value': form.endTime }">
										{{ form.endTime || '00:00' }}
									</view>
								</picker>
							</view>
						</view>
					</view>
					<button class="submit-primary-btn" @click="addSchedule" :disabled="adding">
						<text>{{ adding ? '正在保存...' : '立即发布时段' }}</text>
					</button>
				</view>
				
				<!-- 列表区域 -->
				<view class="section-header animate-fade-in">
					<text class="section-title">我的可用时段</text>
					<text class="section-count" v-if="schedules.length">共 {{ schedules.length }} 条</text>
				</view>

				<view class="schedule-list">
					<view class="loading-state" v-if="loading">
						<view class="spinner"></view>
						<text>加载中...</text>
					</view>
					<view 
						class="schedule-card animate-slide-up" 
						v-for="(item, index) in schedules" 
						:key="item.id"
						:style="{ animationDelay: index * 0.1 + 's' }"
						v-else
					>
						<view class="schedule-left">
							<view class="time-main">
								<text class="main-day">{{ formatDay(item.startTime) }}</text>
								<text class="main-range">{{ formatTimeRange(item) }}</text>
							</view>
							<view class="date-sub">
								<text>{{ formatFullDate(item.startTime) }}</text>
							</view>
						</view>
						<view class="schedule-right">
							<button class="delete-icon-btn" @click="deleteSchedule(item.id)">
								<text class="delete-text">删除</text>
							</button>
						</view>
					</view>
					
					<!-- 空状态 -->
					<view class="empty-state" v-if="!loading && schedules.length === 0">
						<view class="empty-icon schedule-empty"></view>
						<text class="empty-text">您还未添加任何服务时段</text>
						<text class="empty-sub">点击上方表单开始您的工作计划吧</text>
					</view>
				</view>
			</view>
			
			<!-- 已安排订单 -->
			<view class="tab-content" v-if="currentTab === 'orders'">
				<view class="order-list">
					<view class="loading-state" v-if="loading">
						<view class="spinner"></view>
						<text>加载中...</text>
					</view>
					<view 
						class="order-card-modern animate-slide-up" 
						v-for="(order, index) in orders" 
						:key="order.id"
						:style="{ animationDelay: index * 0.1 + 's' }"
						@click="goToOrderDetail(order.id)"
						v-else
					>
						<view class="order-header">
							<view class="type-badge" :class="order.serviceType">
								{{ getServiceTypeName(order.serviceType) }}
							</view>
							<text class="order-id">No.{{ order.id }}</text>
						</view>
						<view class="order-body">
							<view class="info-line">
								<text class="line-label">服务时间：</text>
								<text class="line-value">{{ formatDateTime(order.serviceTime) }}</text>
							</view>
							<view class="info-line">
								<text class="line-label">服务地址：</text>
								<text class="line-value address-text">{{ order.address }}</text>
							</view>
						</view>
						<view class="order-footer">
							<text class="status-tag" :class="order.status">{{ getStatusName(order.status) }}</text>
							<text class="detail-link">查看详情</text>
						</view>
					</view>
					
					<view class="empty-state" v-if="!loading && orders.length === 0">
						<view class="empty-icon orders-empty"></view>
						<text class="empty-text">暂时没有已安排的订单</text>
						<text class="empty-sub">保持时段开启，系统会自动为您匹配</text>
					</view>
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
				startTime: '08:00',
				endTime: '18:00'
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
			uni.showToast({ title: '请先登录', icon: 'none' })
			setTimeout(() => { uni.reLaunch({ url: '/pages/login/login' }) }, 1500)
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
		onDateChange(e) { this.form.date = e.detail.value },
		onStartTimeChange(e) { this.form.startTime = e.detail.value },
		onEndTimeChange(e) { this.form.endTime = e.detail.value },
		addSchedule() {
			if (!this.form.date || !this.form.startTime || !this.form.endTime) {
				return uni.showToast({ title: '请填写完整信息', icon: 'none' })
			}
			const startTime = `${this.form.date} ${this.form.startTime}:00`
			const endTime = `${this.form.date} ${this.form.endTime}:00`
			if (endTime <= startTime) return uni.showToast({ title: '时序排列错误', icon: 'none' })
			
			this.adding = true
			addSchedule(this.userId, startTime, endTime)
				.then(res => {
					if (res.code === 200) {
						uni.showToast({ title: '添加成功', icon: 'success' })
						this.form.date = ''
						this.loadSchedules()
					}
				}).finally(() => { this.adding = false })
		},
		deleteSchedule(scheduleId) {
			uni.showModal({
				title: '确认撤销',
				content: '确定要撤销这个时间段吗？',
				confirmColor: '#FF4D4F',
				success: (res) => {
					if (res.confirm) {
						deleteSchedule(scheduleId, this.userId)
							.then(result => {
								if (result.code === 200) {
									uni.showToast({ title: '已删除', icon: 'success' })
									this.loadSchedules()
								}
							})
					}
				}
			})
		},
		loadSchedules() {
			this.loading = true
			getWorkerSchedules(this.userId)
				.then(res => { if (res.code === 200) this.schedules = res.data || [] })
				.finally(() => { this.loading = false })
		},
		loadOrders() {
			this.loading = true
			getWorkerScheduledOrders(this.userId)
				.then(res => { if (res.code === 200) this.orders = res.data || [] })
				.finally(() => { this.loading = false })
		},
		formatDay(time) {
			const d = new Date(time)
			return ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()]
		},
		formatFullDate(time) {
			const d = new Date(time)
			return `${d.getMonth()+1}月${d.getDate()}日`
		},
		formatTimeRange(schedule) {
			const st = new Date(schedule.startTime)
			const et = new Date(schedule.endTime)
			return `${st.getHours().toString().padStart(2,'0')}:${st.getMinutes().toString().padStart(2,'0')} ~ ${et.getHours().toString().padStart(2,'0')}:${et.getMinutes().toString().padStart(2,'0')}`
		},
		formatDateTime(dateTime) {
			if (!dateTime) return '-'
			const d = new Date(dateTime)
			return `${d.getMonth()+1}月${d.getDate()}日 ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
		},
		getServiceTypeName(type) {
			const map = { 'cleaning': '保洁', 'repair': '维修', 'cooking': '做饭', 'babysitting': '育儿' }
			return map[type] || type
		},
		getStatusName(status) {
			const map = { 'ASSIGNED': '待接单', 'IN_PROGRESS': '服务中', 'COMPLETED': '已完成', 'APPROVED': '待派单', 'PENDING': '审核中' }
			return map[status] || status
		},
		goToOrderDetail(orderId) {
			uni.navigateTo({ url: `/pages/order/detail?id=${orderId}` })
		}
	}
}
</script>

<style lang="scss" scoped>
.schedule-page {
	min-height: 100vh;
	background: #f4f7f9;
}

/* 顶部背景 */
.header-section {
	background: linear-gradient(135deg, #1890ff 0%, #36a3ff 100%);
	padding: 60rpx 40rpx 100rpx;
	border-bottom-right-radius: 80rpx;
	
	.header-content {
		margin-bottom: 50rpx;
		.page-title { font-size: 48rpx; font-weight: bold; color: #fff; display: block; }
		.page-desc { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 10rpx; display: block; }
	}
}

/* 标签切换 */
.modern-tabs {
	display: flex;
	background: rgba(255,255,255,0.15);
	backdrop-filter: blur(10px);
	border-radius: 40rpx;
	padding: 8rpx;
	
	.tab-item {
		flex: 1;
		height: 80rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 0.3s;
		
		&.active .tab-text { color: #fff; font-weight: bold; }
		.tab-text { font-size: 28rpx; color: rgba(255,255,255,0.7); }
		.tab-line {
			position: absolute;
			bottom: 0;
			width: 40rpx;
			height: 6rpx;
			background: #fff;
			border-radius: 3rpx;
		}
	}
}

.content-body {
	margin-top: -60rpx;
	padding: 0 30rpx;
}

/* 卡片 */
.glass-card {
	background: #fff;
	border-radius: 36rpx;
	padding: 40rpx;
	box-shadow: 0 10rpx 30rpx rgba(24, 144, 255, 0.05);
	margin-bottom: 30rpx;
	
	.card-title {
		display: flex;
		align-items: center;
		gap: 12rpx;
		font-size: 30rpx;
		font-weight: bold;
		color: #1a1a1a;
		margin-bottom: 40rpx;
		.iconfont { color: #1890ff; font-size: 36rpx; }
	}
}

/* 表单单项 */
.form-group {
	.form-row {
		margin-bottom: 30rpx;
		.field-label {
			display: flex;
			align-items: center;
			gap: 12rpx;
			font-size: 26rpx;
			color: #8c8c8c;
			margin-bottom: 12rpx;
      .iconfont { font-size: 24rpx; color: #bfbfbf; }
		}
		.picker-box {
			background: #f8fafc;
			height: 88rpx;
			line-height: 88rpx;
			border-radius: 20rpx;
			padding: 0 30rpx;
			font-size: 28rpx;
			color: #cbd5e1;
			border: 1px solid #f1f5f9;
			&.has-value { color: #1e293b; }
		}
	}
	
	.form-grid {
		display: flex;
		gap: 20rpx;
		.half { flex: 1; }
	}
}

.submit-primary-btn {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	background: linear-gradient(90deg, #1890ff, #40a9ff);
	color: #fff;
	border-radius: 45rpx;
	font-size: 30rpx;
	font-weight: bold;
	border: none;
	box-shadow: 0 10rpx 20rpx rgba(24, 144, 255, 0.2);
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 10rpx;
	.section-title { font-size: 30rpx; font-weight: bold; color: #1a1a1a; }
	.section-count { font-size: 24rpx; color: #999; }
}

/* 日程项卡片 */
.schedule-card {
	background: #fff;
	border-radius: 24rpx;
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
	
	.time-main {
		display: flex;
		align-items: center;
		gap: 20rpx;
		.main-day { font-size: 32rpx; font-weight: bold; color: #1890ff; }
		.main-range { font-size: 30rpx; color: #1e293b; font-weight: 500; }
	}
	.date-sub { font-size: 24rpx; color: #94a3b8; margin-top: 6rpx; }
	
	.delete-icon-btn {
		width: 70rpx;
		height: 70rpx;
		background: #fff1f0;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		.iconfont { color: #ff4d4f; font-size: 32rpx; }
	}
}

/* 订单卡片 */
.order-card-modern {
	background: #fff;
	border-radius: 30rpx;
	padding: 30rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.02);
	
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
		.type-badge {
			padding: 4rpx 20rpx;
			border-radius: 12rpx;
			font-size: 22rpx;
			font-weight: 500;
			&.cleaning { background: #e6f7ff; color: #1890ff; }
			&.repair { background: #f6ffed; color: #52c41a; }
			&.cooking { background: #fff7e6; color: #fa8c16; }
			&.babysitting { background: #f9f0ff; color: #722ed1; }
		}
		.order-id { font-size: 22rpx; color: #bfbfbf; }
	}
	
	.order-body {
		.info-line {
			display: flex;
			align-items: flex-start;
			gap: 12rpx;
			margin-bottom: 12rpx;
			font-size: 26rpx;
			color: #595959;
			.address-text { flex: 1; line-height: 1.4; }
		}
	}
	
	.order-footer {
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #f5f5f5;
		display: flex;
		justify-content: space-between;
		align-items: center;
		.status-tag {
			font-size: 24rpx;
			font-weight: 500;
			&.IN_PROGRESS { color: #1890ff; }
			&.APPROVED { color: #13c2c2; }
			&.COMPLETED { color: #52c41a; }
		}
		.detail-link { font-size: 24rpx; color: #1890ff; opacity: 0.8; }
	}
}

/* 空状态 */
.empty-state {
	text-align: center;
	padding: 100rpx 40rpx;
	.empty-icon {
		width: 200rpx;
		height: 200rpx;
		margin: 0 auto 30rpx;
		background-size: contain;
		background-repeat: no-repeat;
		opacity: 0.3;
		&.schedule-empty { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm1-11h-2v5h5v-2h-3z"/></svg>'); }
		&.orders-empty { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h2v-2h-2v2zm0-4h2V7h-2v6z"/></svg>'); }
	}
	.empty-text { font-size: 30rpx; color: #64748b; font-weight: 500; display: block; }
	.empty-sub { font-size: 24rpx; color: #94a3b8; margin-top: 10rpx; display: block; }
}

.loading-state {
	padding: 100rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
	color: #94a3b8;
	font-size: 26rpx;
	.spinner {
		width: 48rpx;
		height: 48rpx;
		border: 4rpx solid #e2e8f0;
		border-top-color: #1890ff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
}

@keyframes spin { to { transform: rotate(360deg); } }

/* 动画库 */
@keyframes slideDown { from { opacity: 0; transform: translateY(-30rpx); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30rpx); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.animate-slide-down { animation: slideDown 0.5s ease-out; }
.animate-slide-up { animation: slideUp 0.6s ease-out; fill-mode: both; }
.animate-fade-in { animation: fadeIn 0.8s ease; }

/* 内联图标 */
.icon-clock-mini { width: 30rpx; height: 30rpx; background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.3 14.71L11 12.41V7h2v4.59l3.71 3.71-1.42 1.41z"/></svg>'); background-size: contain; }
.icon-loc-mini { width: 30rpx; height: 30rpx; background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'); background-size: contain; }
</style>
