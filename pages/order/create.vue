<template>
	<view class="create-order">
		<!-- 背景装饰 -->
		<view class="page-bg-header"></view>
		
		<view class="scroll-body">
			<view class="page-title-box animate-fade-in">
				<text class="main-title">预约服务</text>
				<text class="sub-heading">请填写您的具体服务需求</text>
			</view>
			
			<view class="form-card animate-slide-up">
				<!-- 服务类型 - 静态展示 -->
				<view class="form-item readonly">
					<view class="item-header">
						<text class="iconfont icon-category"></text>
						<text class="label">服务类型</text>
					</view>
					<view class="readonly-content">
						<text class="type-tag">{{ getServiceTypeName(formData.serviceType) }}</text>
					</view>
				</view>
				
				<!-- 服务地址 -->
				<view class="form-item">
					<view class="item-header">
						<text class="iconfont icon-location"></text>
						<text class="label">服务地址</text>
					</view>
					<view class="input-wrapper">
						<input 
							class="input-node" 
							v-model="formData.address" 
							placeholder="请输入具体上门地点" 
							placeholder-style="color: #bfbfbf"
						/>
					</view>
				</view>
				
				<!-- 服务时间 -->
				<view class="form-item">
					<view class="item-header">
						<text class="iconfont icon-time"></text>
						<text class="label">预约时间</text>
					</view>
					<view class="picker-group">
						<picker mode="date" :value="date" @change="bindDateChange" class="picker-node">
							<view class="picker-val" :class="{ placeholder: !date }">
								<text class="iconfont icon-calendar"></text>
								{{ date || '选择日期' }}
							</view>
						</picker>
						<picker mode="time" :value="time" @change="bindTimeChange" class="picker-node">
							<view class="picker-val" :class="{ placeholder: !time }">
								<text class="iconfont icon-clock"></text>
								{{ time || '选择时间' }}
							</view>
						</picker>
					</view>
				</view>
				
				<!-- 订单金额 -->
				<view class="form-item">
					<view class="item-header">
						<text class="iconfont icon-money"></text>
						<text class="label">预估金额</text>
						<text class="required-dot">*</text>
					</view>
					<view class="amount-field">
						<text class="currency">¥</text>
						<input 
							class="amount-input-node" 
							type="digit" 
							v-model="formData.amount" 
							placeholder="0.00" 
							placeholder-style="color: #bfbfbf"
							@input="handleAmountInput"
						/>
					</view>
					<text class="form-tip">请输入合理金额（支持两位小数）</text>
				</view>
				
				<!-- 服务说明 -->
				<view class="form-item last">
					<view class="item-header">
						<text class="iconfont icon-edit"></text>
						<text class="label">特殊需求</text>
					</view>
					<view class="textarea-wrapper">
						<textarea 
							class="textarea-node" 
							v-model="formData.description" 
							placeholder="如有特殊要求请备注（如：家里有宠物等）" 
							placeholder-style="color: #bfbfbf"
							maxlength="200"
						/>
						<text class="char-count">{{ formData.description.length }}/200</text>
					</view>
				</view>
			</view>
			
			<view class="action-section animate-slide-up">
				<button class="primary-btn-styled" @click="handleSubmit" :disabled="loading">
					<text v-if="loading">正在处理中...</text>
					<text v-else>立即提交订单</text>
				</button>
				<text class="security-tip">我们的服务员均经过严格筛选与实名认证</text>
			</view>
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
				amount: ''
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
		handleAmountInput(e) {
			let value = e.detail.value
			value = value.replace(/[^\d.]/g, '')
			const parts = value.split('.')
			if (parts.length > 2) {
				value = parts[0] + '.' + parts.slice(1).join('')
			}
			if (parts.length === 2 && parts[1].length > 2) {
				value = parts[0] + '.' + parts[1].substring(0, 2)
			}
			this.formData.amount = value
		},
		handleSubmit() {
			if (!this.formData.address) {
				return uni.showToast({ title: '请输入服务地址', icon: 'none' })
			}
			if (!this.formData.serviceTime) {
				return uni.showToast({ title: '请选择服务时间', icon: 'none' })
			}
			if (!this.formData.amount || parseFloat(this.formData.amount) <= 0) {
				return uni.showToast({ title: '请输入有效的预估金额', icon: 'none' })
			}
			
			const amount = parseFloat(this.formData.amount)
			const submitData = {
				...this.formData,
				amount: amount
			}
			
			this.loading = true
			createOrder(this.userId, submitData)
				.then(res => {
					if (res.code === 200) {
						uni.showToast({ title: '预约提交成功', icon: 'success' })
						setTimeout(() => { uni.navigateBack() }, 1500)
					}
				})
				.catch(err => {
					console.error('提交失败:', err)
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

<style lang="scss" scoped>
.create-order {
	min-height: 100vh;
	background: #f8fafc;
	position: relative;
}

.page-bg-header {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 360rpx;
	background: linear-gradient(180deg, #1890ff 0%, #f8fafc 100%);
	z-index: 0;
}

.scroll-body {
	position: relative;
	z-index: 1;
	padding: 40rpx 30rpx;
}

.page-title-box {
	padding: 40rpx 10rpx;
	.main-title {
		display: block;
		font-size: 48rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 12rpx;
	}
	.sub-heading {
		font-size: 26rpx;
		color: rgba(255,255,255,0.85);
	}
}

/* Form Card */
.form-card {
	background: #ffffff;
	border-radius: 40rpx;
	padding: 50rpx 40rpx;
	box-shadow: 0 20rpx 50rpx rgba(0,0,0,0.04);
}

.form-item {
	margin-bottom: 50rpx;
	
	&.last {
		margin-bottom: 0;
	}
	
	.item-header {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
		
		.label {
			font-size: 30rpx;
			color: #333;
			font-weight: 600;
			margin-left: 12rpx;
		}
		
		.required-dot {
			color: #ff4d4f;
			margin-left: 8rpx;
			font-size: 30rpx;
		}
	}
}

/* Specific Input Styles */
.readonly-content {
	background: #f0f7ff;
	border-radius: 16rpx;
	padding: 24rpx 30rpx;
	.type-tag {
		color: #1890ff;
		font-weight: 600;
		font-size: 30rpx;
	}
}

.input-wrapper {
	background: #f8fafc;
	border-radius: 20rpx;
	padding: 0 30rpx;
	height: 100rpx;
	display: flex;
	align-items: center;
	border: 1px solid #edf2f7;
	
	.input-node {
		flex: 1;
		font-size: 28rpx;
		color: #333;
	}
}

.picker-group {
	display: flex;
	gap: 20rpx;
	.picker-node {
		flex: 1;
	}
	.picker-val {
		background: #f8fafc;
		border-radius: 20rpx;
		height: 90rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26rpx;
		color: #333;
		border: 1px solid #edf2f7;
		gap: 10rpx;
		
		&.placeholder {
			color: #bfbfbf;
		}
	}
}

.amount-field {
	display: flex;
	align-items: center;
	background: #fff;
	border-bottom: 4rpx solid #1890ff;
	padding: 20rpx 0;
	
	.currency {
		font-size: 40rpx;
		font-weight: bold;
		color: #1890ff;
		margin-right: 16rpx;
	}
	
	.amount-input-node {
		flex: 1;
		font-size: 52rpx;
		font-weight: 800;
		color: #333;
	}
}

.form-tip {
	font-size: 22rpx;
	color: #999;
	margin-top: 14rpx;
	display: block;
}

.textarea-wrapper {
	background: #f8fafc;
	border-radius: 24rpx;
	padding: 30rpx;
	position: relative;
	border: 1px solid #edf2f7;
	
	.textarea-node {
		width: 100%;
		height: 180rpx;
		font-size: 28rpx;
		line-height: 1.6;
		color: #333;
	}
	
	.char-count {
		position: absolute;
		right: 30rpx;
		bottom: 20rpx;
		font-size: 22rpx;
		color: #ccc;
	}
}

/* Action Section */
.action-section {
	padding: 60rpx 0 100rpx;
	text-align: center;
}

.primary-btn-styled {
	width: 100%;
	height: 100rpx;
	line-height: 100rpx;
	background: linear-gradient(90deg, #1890ff, #36a3ff);
	color: #ffffff;
	border-radius: 50rpx;
	font-size: 34rpx;
	font-weight: bold;
	box-shadow: 0 16rpx 32rpx rgba(24, 144, 255, 0.2);
	border: none;
	
	&:active {
		transform: scale(0.98);
	}
	
	&[disabled] {
		background: #ccc;
		box-shadow: none;
		opacity: 0.6;
	}
}

.security-tip {
	display: block;
	margin-top: 30rpx;
	font-size: 22rpx;
	color: #abb6c1;
}

/* Animations */
@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

@keyframes slideUp {
	from { opacity: 0; transform: translateY(40rpx); }
	to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in { animation: fadeIn 0.8s ease; }
.animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.18, 0.89, 0.32, 1.28); }

/* SVG Icons via iconfont placeholders or custom */
.iconfont {
	font-size: 34rpx;
	color: #1890ff;
}
</style>
