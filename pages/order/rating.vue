<template>
	<view class="rating-page">
		<view class="rating-card">
			<text class="title">服务评价</text>
			
			<view class="rating-section">
				<text class="label">评分</text>
				<view class="stars">
					<text 
						class="star" 
						v-for="(item, index) in 5" 
						:key="index"
						:class="{ active: index < rating }"
						@click="setRating(index + 1)"
					>
						⭐
					</text>
				</view>
			</view>
			
			<view class="comment-section">
				<text class="label">评价内容</text>
				<textarea 
					class="textarea" 
					v-model="comment" 
					placeholder="请输入评价内容（选填）"
					maxlength="200"
				></textarea>
			</view>
			
			<button class="submit-btn" @click="handleSubmit" :disabled="loading || rating === 0">
				{{ loading ? '提交中...' : '提交评价' }}
			</button>
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
			userId: ''
		}
	},
	onLoad(options) {
		this.orderId = options.id
		this.userId = uni.getStorageSync('userId')
		this.loadOrder()
	},
	methods: {
		loadOrder() {
			getOrderDetail(this.orderId)
				.then(res => {
					if (res.code === 200) {
						this.order = res.data
					}
				})
		},
		setRating(value) {
			this.rating = value
		},
		handleSubmit() {
			if (this.rating === 0) {
				uni.showToast({
					title: '请选择评分',
					icon: 'none'
				})
				return
			}
			
			if (!this.order) {
				uni.showToast({
					title: '订单信息加载中',
					icon: 'none'
				})
				return
			}
			
			// 确定被评价人ID（客户评价服务员，或服务员评价客户）
			const rateeId = this.userId === this.order.customerId 
				? this.order.workerId 
				: this.order.customerId
			
			this.loading = true
			createRating(this.orderId, this.userId, rateeId, this.rating, this.comment)
				.then(res => {
					if (res.code === 200) {
						uni.showToast({
							title: '评价成功',
							icon: 'success'
						})
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					}
				})
				.catch(err => {
					console.error('评价失败:', err)
				})
				.finally(() => {
					this.loading = false
				})
		}
	}
}
</script>

<style scoped>
.rating-page {
	min-height: 100vh;
	background: #F5F5F5;
	padding: 40rpx;
}

.rating-card {
	background: #fff;
	border-radius: 20rpx;
	padding: 40rpx;
}

.title {
	display: block;
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 40rpx;
	text-align: center;
}

.rating-section {
	margin-bottom: 40rpx;
}

.label {
	display: block;
	font-size: 28rpx;
	color: #333;
	margin-bottom: 20rpx;
}

.stars {
	display: flex;
	gap: 20rpx;
}

.star {
	font-size: 50rpx;
	color: #ddd;
	transition: all 0.3s;
}

.star.active {
	color: #FFD700;
}

.comment-section {
	margin-bottom: 40rpx;
}

.textarea {
	width: 100%;
	min-height: 200rpx;
	padding: 20rpx;
	border: 2rpx solid #ddd;
	border-radius: 10rpx;
	font-size: 28rpx;
}

.submit-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background: #1890FF;
	color: #fff;
	border-radius: 10rpx;
	font-size: 32rpx;
	border: none;
}

.submit-btn[disabled] {
	background: #ccc;
}
</style>
