<template>
	<view class="pay-page">
		<view class="pay-info">
			<text class="amount-label">支付金额</text>
			<text class="amount">¥{{ amount }}</text>
		</view>
		
		<view class="order-info">
			<text class="info-label">订单信息</text>
			<text class="info-text">订单号：{{ orderId }}</text>
		</view>
		
		<button class="pay-btn" @click="handlePay" :disabled="loading">
			{{ loading ? '支付中...' : '确认支付' }}
		</button>
		
		<view class="tip">
			<text>提示：此为模拟支付，不会产生实际费用</text>
		</view>
	</view>
</template>

<script>
import { payOrder } from '../../api/order'

export default {
	data() {
		return {
			orderId: '',
			amount: 100.00,
			loading: false
		}
	},
	onLoad(options) {
		this.orderId = options.id
		// 这里可以从订单详情获取金额，简化处理使用固定金额
	},
	methods: {
		handlePay() {
			this.loading = true
			payOrder(this.orderId, this.amount)
				.then(res => {
					if (res.code === 200) {
						uni.showToast({
							title: '支付成功',
							icon: 'success'
						})
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					}
				})
				.catch(err => {
					console.error('支付失败:', err)
				})
				.finally(() => {
					this.loading = false
				})
		}
	}
}
</script>

<style scoped>
.pay-page {
	min-height: 100vh;
	background: #F5F5F5;
	padding: 40rpx;
}

.pay-info {
	background: #fff;
	border-radius: 20rpx;
	padding: 60rpx 40rpx;
	text-align: center;
	margin-bottom: 20rpx;
}

.amount-label {
	display: block;
	font-size: 28rpx;
	color: #999;
	margin-bottom: 20rpx;
}

.amount {
	display: block;
	font-size: 60rpx;
	font-weight: bold;
	color: #1890FF;
}

.order-info {
	background: #fff;
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
}

.info-label {
	display: block;
	font-size: 28rpx;
	color: #333;
	margin-bottom: 20rpx;
}

.info-text {
	font-size: 26rpx;
	color: #666;
}

.pay-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background: #1890FF;
	color: #fff;
	border-radius: 10rpx;
	font-size: 32rpx;
	border: none;
}

.pay-btn[disabled] {
	background: #ccc;
}

.tip {
	text-align: center;
	margin-top: 40rpx;
	font-size: 24rpx;
	color: #999;
}
</style>
