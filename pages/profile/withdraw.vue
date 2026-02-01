<template>
	<view class="withdraw-page">
		<view class="balance-tip">
			<text class="label">可提现余额</text>
			<text class="value">¥ {{ formatBalance(balance) }}</text>
		</view>
		<view class="form-card">
			<view class="form-item">
				<text class="label">提现金额</text>
				<input 
					class="input" 
					type="digit" 
					v-model="amount" 
					placeholder="请输入提现金额"
					placeholder-style="color: #ccc"
				/>
			</view>
			<button class="submit-btn" @click="handleWithdraw" :disabled="submitting">
				{{ submitting ? '处理中...' : '提现' }}
			</button>
			<view class="tip">提现即时到账</view>
		</view>
	</view>
</template>

<script>
import { getUserInfo, withdraw } from '../../api/user'

export default {
	data() {
		return {
			balance: 0,
			amount: '',
			userId: 0,
			submitting: false
		}
	},
	onLoad() {
		this.userId = parseInt(uni.getStorageSync('userId')) || 0
		if (!this.userId) {
			uni.reLaunch({ url: '/pages/login/login' })
			return
		}
		this.loadBalance()
	},
	methods: {
		loadBalance() {
			getUserInfo(this.userId).then(res => {
				if (res.code === 200 && res.data) {
					this.balance = res.data.balance != null ? res.data.balance : 0
				}
			})
		},
		formatBalance(b) {
			const n = parseFloat(b)
			return isNaN(n) ? '0.00' : n.toFixed(2)
		},
		handleWithdraw() {
			const num = parseFloat(this.amount)
			if (isNaN(num) || num <= 0) {
				uni.showToast({ title: '请输入有效金额', icon: 'none' })
				return
			}
			if (num > this.balance) {
				uni.showToast({ title: '余额不足', icon: 'none' })
				return
			}
			this.submitting = true
			withdraw(this.userId, num)
				.then(res => {
					if (res.code === 200) {
						uni.showToast({ title: '提现成功', icon: 'success' })
						setTimeout(() => uni.navigateBack(), 1500)
					} else {
						uni.showToast({ title: res.message || '提现失败', icon: 'none' })
					}
				})
				.catch(err => {
					uni.showToast({ title: err.message || '提现失败', icon: 'none' })
				})
				.finally(() => { this.submitting = false })
		}
	}
}
</script>

<style lang="scss" scoped>
.withdraw-page {
	min-height: 100vh;
	background: #f8fafc;
	padding: 30rpx;
}

.balance-tip {
	background: linear-gradient(135deg, #1890ff, #40a9ff);
	border-radius: 24rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	.label { display: block; font-size: 26rpx; color: rgba(255,255,255,0.8); margin-bottom: 12rpx; }
	.value { font-size: 48rpx; font-weight: bold; color: #fff; }
}

.form-card {
	background: #fff;
	border-radius: 24rpx;
	padding: 40rpx;
	box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.04);
}

.form-item {
	margin-bottom: 30rpx;
	.label { display: block; font-size: 28rpx; color: #64748b; margin-bottom: 16rpx; }
	.input {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		padding: 0 24rpx;
		background: #f8fafc;
		border-radius: 12rpx;
		font-size: 32rpx;
		color: #1e293b;
		box-sizing: border-box;
	}
}

.submit-btn {
	margin-top: 20rpx;
	height: 88rpx;
	line-height: 88rpx;
	background: linear-gradient(90deg, #1890ff, #40a9ff);
	color: #fff;
	border-radius: 44rpx;
	font-size: 30rpx;
	font-weight: bold;
	border: none;
}

.tip {
	margin-top: 30rpx;
	font-size: 24rpx;
	color: #94a3b8;
	text-align: center;
}
</style>
