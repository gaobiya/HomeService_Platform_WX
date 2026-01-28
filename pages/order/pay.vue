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
		
		<button class="pay-btn" @click="handlePay" :disabled="loading || orderLoading || !amount || parseFloat(amount) <= 0">
			{{ loading ? '支付中...' : (orderLoading ? '加载中...' : '确认支付') }}
		</button>
		
		<view class="tip">
			<text>提示：此为模拟支付，不会产生实际费用</text>
		</view>
	</view>
</template>

<script>
import { payOrder, getOrderDetail } from '../../api/order'

export default {
	data() {
		return {
			orderId: '',
			amount: '0.00', // 使用字符串格式，方便显示两位小数
			loading: false,
			orderLoading: true
		}
	},
	onLoad(options) {
		this.orderId = options.id
		// 从订单详情获取金额
		this.loadOrderDetail()
	},
	methods: {
		/**
		 * 加载订单详情，获取订单金额
		 */
		loadOrderDetail() {
			this.orderLoading = true
			getOrderDetail(this.orderId)
				.then(res => {
					if (res.code === 200 && res.data) {
						// 从订单中获取金额，如果订单没有金额或金额为0，提示用户
						const orderAmount = res.data.amount
						if (orderAmount && parseFloat(orderAmount) > 0) {
							// 保留两位小数
							this.amount = parseFloat(orderAmount).toFixed(2)
						} else {
							// 如果订单没有设置金额，提示用户
							uni.showToast({
								title: '订单金额未设置',
								icon: 'none',
								duration: 2000
							})
							this.amount = '0.00'
						}
					} else {
						uni.showToast({
							title: '获取订单信息失败',
							icon: 'none'
						})
						this.amount = '0.00'
					}
				})
				.catch(err => {
					console.error('加载订单详情失败:', err)
					uni.showToast({
						title: '加载订单信息失败',
						icon: 'none'
					})
					this.amount = '0.00'
				})
				.finally(() => {
					this.orderLoading = false
				})
		},
		handlePay() {
			// 检查金额是否有效
			const payAmount = parseFloat(this.amount)
			if (!payAmount || payAmount <= 0) {
				uni.showToast({
					title: '订单金额无效，无法支付',
					icon: 'none'
				})
				return
			}
			
			this.loading = true
			// 传递数字类型的金额给后端
			payOrder(this.orderId, payAmount)
				.then(res => {
					if (res.code === 200) {
						uni.showToast({
							title: '支付成功',
							icon: 'success'
						})
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					} else {
						uni.showToast({
							title: res.message || '支付失败',
							icon: 'none'
						})
					}
				})
				.catch(err => {
					console.error('支付失败:', err)
					uni.showToast({
						title: err.message || '支付失败，请重试',
						icon: 'none'
					})
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
