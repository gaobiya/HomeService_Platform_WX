<template>
	<view class="rating-page">
		<!-- 沉浸式顶部 -->
		<view class="header-section">
			<view class="header-content animate-slide-down">
				<text class="page-title">{{ ratingTitle }}</text>
				<text class="page-desc">您的真实评价是提升服务质量的关键</text>
			</view>
		</view>

		<view class="content-body" v-if="order">
			<!-- 订单概览简报 -->
			<view class="order-summary-card animate-slide-up">
				<view class="summary-row">
					<text class="label">订单编号：</text>
					<text class="value">{{ orderId }}</text>
				</view>
				<view class="summary-row">
					<text class="label">服务项目：</text>
					<text class="value">{{ getServiceTypeName(order.serviceType) }}</text>
				</view>
			</view>

			<!-- 评价主卡片 -->
			<view class="rating-main-card animate-slide-up delay-1">
				<view class="rating-section">
					<text class="section-title">总体服务评分</text>
					<view class="stars-container">
						<view 
							class="star-item" 
							v-for="(item, index) in 5" 
							:key="index"
							@click="setRating(index + 1)"
						>
							<view class="star-icon" :class="{ active: index < rating }"></view>
						</view>
					</view>
				</view>

				<view class="comment-section">
					<text class="section-title">您的评价内容</text>
					<view class="textarea-wrapper">
						<textarea 
							class="custom-textarea" 
							v-model="comment" 
							placeholder="分享您的服务细节体验，帮助我们做得更好..."
							placeholder-style="color: #cbd5e1"
							maxlength="200"
						></textarea>
						<text class="char-count">{{ comment.length }}/200</text>
					</view>
				</view>

				<button class="submit-primary-btn" @click="handleSubmit" :disabled="loading || rating === 0">
					{{ loading ? '正在提交中...' : '提交评价反馈' }}
				</button>
			</view>
		</view>

		<view class="loading-state" v-else>
			<view class="spinner"></view>
			<text>数据同步中...</text>
		</view>
	</view>
</template>

<script>
import { createRating } from '../../api/rating'
import { getOrderDetail } from '../../api/order'

export default {
	data() {
		return {
			orderId: '',
			order: null,
			rating: 0,
			comment: '',
			loading: false,
			userId: '',
			userRole: '',
			ratingTitle: '评价反馈',
		}
	},
	onLoad(options) {
		this.orderId = parseInt(options.id) || 0
		this.userId = parseInt(uni.getStorageSync('userId')) || 0
		this.userRole = uni.getStorageSync('role') || ''
		this.loadOrder()
	},
	methods: {
		loadOrder() {
			getOrderDetail(this.orderId)
				.then(res => {
					if (res.code === 200) {
						this.order = res.data
						this.ratingTitle = this.userRole === 'worker' ? '评价您的客户' : '评价家政服务'
					}
				})
		},
		setRating(value) {
			this.rating = value
		},
		getServiceTypeName(type) {
			const map = { 'cleaning': '精品保洁', 'repair': '专业维修', 'cooking': '爱心做饭', 'babysitting': '育儿管家' }
			return map[type] || type
		},
		handleSubmit() {
			if (this.rating === 0) return uni.showToast({ title: '请给出评分', icon: 'none' })
			if (this.userRole === 'worker' && this.order.paid === 0) {
				return uni.showToast({ title: '客户支付后方可评价', icon: 'none' })
			}
			
			const rateeId = this.userId === this.order.customerId ? this.order.workerId : this.order.customerId
			if (!rateeId) return uni.showToast({ title: '未找到被评价对象', icon: 'none' })
			
			this.loading = true
			createRating(parseInt(this.orderId), parseInt(this.userId), parseInt(rateeId), this.rating, this.comment)
				.then(res => {
					if (res.code === 200) {
						uni.showToast({ title: '评价已提交', icon: 'success' })
						setTimeout(() => { uni.navigateBack() }, 1500)
					}
				})
				.finally(() => { this.loading = false })
		}
	}
}
</script>

<style lang="scss" scoped>
.rating-page {
	min-height: 100vh;
	background: #f8fafc;
	padding-bottom: 60rpx;
}

/* 顶部背景 */
.header-section {
	background: linear-gradient(135deg, #1890ff 0%, #36a3ff 100%);
	padding: 80rpx 50rpx 120rpx;
	border-bottom-right-radius: 80rpx;
	
	.header-content {
		.page-title { font-size: 48rpx; font-weight: bold; color: #fff; display: block; }
		.page-desc { font-size: 26rpx; color: rgba(255,255,255,0.85); margin-top: 16rpx; display: block; }
	}
}

.content-body {
	margin-top: -60rpx;
	padding: 0 30rpx;
}

/* 订单简报 */
.order-summary-card {
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
	border-radius: 30rpx;
	padding: 30rpx 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.03);
	
	.summary-row {
		display: flex;
		justify-content: space-between;
		padding: 8rpx 0;
		font-size: 26rpx;
		.label { color: #94a3b8; }
		.value { color: #334155; font-weight: 500; }
	}
}

/* 评价主卡片 */
.rating-main-card {
	background: #ffffff;
	border-radius: 40rpx;
	padding: 50rpx 40rpx;
	box-shadow: 0 10rpx 40rpx rgba(149, 157, 165, 0.08);
}

.section-title {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	color: #1a1a1a;
	margin-bottom: 40rpx;
	text-align: center;
}

/* 星级评价 */
.stars-container {
	display: flex;
	justify-content: center;
	gap: 30rpx;
	margin-bottom: 50rpx;
}

.star-item {
	padding: 10rpx;
}

.star-icon {
	width: 80rpx;
	height: 80rpx;
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;
	transition: background-image 0.2s ease;
	
	/* 默认灰星 */
	background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e2e8f0"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>');
	
	&.active {
		/* 激活金星 */
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffb800"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>');
	}
}



/* 输入框 */
.textarea-wrapper {
	position: relative;
	background: #f8fafc;
	border-radius: 30rpx;
	padding: 30rpx;
	border: 2rpx solid #f1f5f9;
	margin-bottom: 60rpx;
}

.custom-textarea {
	width: 100%;
	height: 240rpx;
	font-size: 28rpx;
	color: #1e293b;
	line-height: 1.6;
}

.char-count {
	position: absolute;
	right: 30rpx;
	bottom: 20rpx;
	font-size: 22rpx;
	color: #94a3b8;
}

/* 提交按钮 */
.submit-primary-btn {
	width: 100%;
	height: 100rpx;
	background: linear-gradient(90deg, #1890ff, #40a9ff);
	color: #fff;
	border-radius: 50rpx;
	font-size: 32rpx;
	font-weight: bold;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 12rpx 24rpx rgba(24, 144, 255, 0.25);
	
	&::after { border: none; }
	&[disabled] { opacity: 0.5; box-shadow: none; }
}

/* 加载状态 */
.loading-state {
	padding: 200rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 30rpx;
	color: #94a3b8;
	.spinner {
		width: 50rpx;
		height: 50rpx;
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
.animate-fade-in { animation: fadeIn 1s ease; }

.delay-1 { animation-delay: 0.1s; }
</style>
