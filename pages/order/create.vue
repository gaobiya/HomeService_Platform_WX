<template>
	<view class="create-order">
		<view class="form-container">
			<view class="form-item">
				<text class="label">服务类型</text>
				<input class="input" :value="getServiceTypeName(formData.serviceType)" disabled placeholder="服务类型" />
			</view>
			
			<view class="form-item">
				<text class="label">服务地址</text>
				<input class="input" v-model="formData.address" placeholder="请输入服务地址" />
			</view>
			
			<view class="form-item">
				<text class="label">服务时间</text>
				<picker mode="date" :value="date" @change="bindDateChange">
					<view class="picker">{{ date || '请选择日期' }}</view>
				</picker>
				<picker mode="time" :value="time" @change="bindTimeChange">
					<view class="picker">{{ time || '请选择时间' }}</view>
				</picker>
			</view>
			
			<view class="form-item">
				<text class="label">订单金额 <text class="required">*</text></text>
				<view class="amount-input-wrapper">
					<text class="amount-symbol">¥</text>
					<input 
						class="amount-input" 
						type="digit" 
						v-model="formData.amount" 
						placeholder="请输入订单金额" 
						@input="handleAmountInput"
					/>
				</view>
				<text class="amount-tip">请输入大于0的金额，最多保留两位小数</text>
			</view>
			
			<view class="form-item">
				<text class="label">服务说明</text>
				<textarea class="textarea" v-model="formData.description" placeholder="请输入服务说明（选填）" />
			</view>
			
			<button class="submit-btn" @click="handleSubmit" :disabled="loading">
				{{ loading ? '提交中...' : '提交订单' }}
			</button>
		</view>
	</view>
</template>

<script>
import { createOrder } from '../../api/order'

export default {
	data() {
		return {
		formData: {
			serviceType: '',
			address: '',
			description: '',
			serviceTime: null,
			amount: '' // 订单金额
		},
		date: '',
		time: '',
		loading: false,
		userId: ''
	}
	},
	onLoad(options) {
		this.userId = uni.getStorageSync('userId')
		if (options.serviceType) {
			this.formData.serviceType = options.serviceType
		}
	},
	methods: {
		bindDateChange(e) {
			this.date = e.detail.value
			this.updateServiceTime()
		},
		bindTimeChange(e) {
			this.time = e.detail.value
			this.updateServiceTime()
		},
	updateServiceTime() {
		if (this.date && this.time) {
			this.formData.serviceTime = `${this.date} ${this.time}:00`
		}
	},
	/**
	 * 处理金额输入，确保格式正确
	 */
	handleAmountInput(e) {
		let value = e.detail.value
		// 移除非数字和小数点的字符
		value = value.replace(/[^\d.]/g, '')
		// 确保只有一个小数点
		const parts = value.split('.')
		if (parts.length > 2) {
			value = parts[0] + '.' + parts.slice(1).join('')
		}
		// 限制小数位数为2位
		if (parts.length === 2 && parts[1].length > 2) {
			value = parts[0] + '.' + parts[1].substring(0, 2)
		}
		this.formData.amount = value
	},
	handleSubmit() {
		if (!this.formData.address) {
			uni.showToast({
				title: '请输入服务地址',
				icon: 'none'
			})
			return
		}
		
		if (!this.formData.serviceTime) {
			uni.showToast({
				title: '请选择服务时间',
				icon: 'none'
			})
			return
		}
		
		// 验证金额
		if (!this.formData.amount || this.formData.amount.trim() === '') {
			uni.showToast({
				title: '请输入订单金额',
				icon: 'none'
			})
			return
		}
		
		const amount = parseFloat(this.formData.amount)
		if (isNaN(amount) || amount <= 0) {
			uni.showToast({
				title: '订单金额必须大于0',
				icon: 'none'
			})
			return
		}
		
		// 准备提交数据，确保金额是数字类型
		const submitData = {
			...this.formData,
			amount: amount
		}
		
		this.loading = true
		createOrder(this.userId, submitData)
				.then(res => {
					if (res.code === 200) {
						uni.showToast({
							title: '订单创建成功',
							icon: 'success'
						})
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					}
				})
				.catch(err => {
					console.error('创建订单失败:', err)
				})
				.finally(() => {
					this.loading = false
				})
		},
		getServiceTypeName(type) {
			const map = {
				'cleaning': '保洁服务',
				'repair': '维修服务',
				'cooking': '做饭服务',
				'babysitting': '育儿服务'
			}
			return map[type] || type
		}
	}
}
</script>

<style scoped>
.create-order {
	min-height: 100vh;
	background: #F5F5F5;
	padding: 20rpx;
}

.form-container {
	background: #fff;
	border-radius: 20rpx;
	padding: 40rpx;
}

.form-item {
	margin-bottom: 40rpx;
}

.label {
	display: block;
	font-size: 28rpx;
	color: #333;
	margin-bottom: 20rpx;
}

.input {
	width: 100%;
	height: 80rpx;
	padding: 0 20rpx;
	border: 2rpx solid #ddd;
	border-radius: 10rpx;
	font-size: 28rpx;
}

.picker {
	height: 80rpx;
	line-height: 80rpx;
	padding: 0 20rpx;
	border: 2rpx solid #ddd;
	border-radius: 10rpx;
	margin-bottom: 20rpx;
	font-size: 28rpx;
}

.textarea {
	width: 100%;
	min-height: 200rpx;
	padding: 20rpx;
	border: 2rpx solid #ddd;
	border-radius: 10rpx;
	font-size: 28rpx;
}

.required {
	color: #FF4D4F;
	margin-left: 4rpx;
}

.amount-input-wrapper {
	display: flex;
	align-items: center;
	border: 2rpx solid #ddd;
	border-radius: 10rpx;
	padding: 0 20rpx;
	height: 80rpx;
}

.amount-symbol {
	font-size: 28rpx;
	color: #333;
	margin-right: 10rpx;
}

.amount-input {
	flex: 1;
	font-size: 28rpx;
	height: 100%;
}

.amount-tip {
	display: block;
	font-size: 24rpx;
	color: #999;
	margin-top: 10rpx;
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
	margin-top: 40rpx;
}

.submit-btn[disabled] {
	background: #ccc;
}
</style>
