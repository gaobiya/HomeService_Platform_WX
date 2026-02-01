<template>
	<view class="service-type-page">
		<!-- 沉浸式顶部 -->
		<view class="header-section">
			<view class="header-content animate-slide-down">
				<text class="page-title">服务项目设置</text>
				<text class="page-desc">开启您的专业服务，开启高效接单之旅</text>
			</view>
		</view>
		
		<view class="content-body">
			<view class="section-tip animate-fade-in">
				<text>请勾选您可以提供的服务类型</text>
			</view>

			<view class="service-list" v-if="!loading">
				<view 
					class="service-card animate-slide-up" 
					v-for="(item, index) in serviceTypes" 
					:key="index"
					:class="{ active: selectedTypes.includes(item.value) }"
					:style="{ animationDelay: index * 0.1 + 's' }"
					@click="toggleService(item.value)"
				>
					<view class="card-main">
						<view class="service-info">
							<text class="service-name">{{ item.label }}</text>
							<text class="service-desc">{{ item.desc }}</text>
						</view>
						<view class="check-box-wrapper">
							<view class="custom-checkbox" :class="{ checked: selectedTypes.includes(item.value) }">
								<text v-if="selectedTypes.includes(item.value)">✓</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<view class="loading-state" v-if="loading">
				<view class="spinner"></view>
				<text>正在同步数据...</text>
			</view>
			
			<view class="empty-state" v-if="!loading && serviceTypes.length === 0">
				<text>暂无可选服务类型</text>
			</view>
		</view>

		<!-- 底部固定保存栏 -->
		<view class="fixed-footer animate-slide-up">
			<button class="save-primary-btn" @click="saveServiceTypes" :disabled="saving || loading">
				<text>{{ saving ? '保存中...' : '确认并保存设置' }}</text>
			</button>
		</view>
	</view>
</template>

<script>
import { setWorkerServiceTypes, getWorkerServiceTypes } from '../../api/worker'

export default {
	data() {
		return {
			userId: 0,
			selectedTypes: [],
			saving: false,
			loading: true,
			serviceTypes: [
				{ value: 'cleaning', label: '精品保洁', desc: '包含日常保洁、深度扫除、开荒保洁等专业服务' },
				{ value: 'repair', label: '专业维修', desc: '家电清洗维修、水电管道疏通、精细木工维修' },
				{ value: 'cooking', label: '爱心做饭', desc: '家庭日常午/晚餐烹饪、营养配餐、火锅上门' },
				{ value: 'babysitting', label: '育儿管家', desc: '幼儿看护、绘本阅读、科学育儿辅导' }
			]
		}
	},
	onLoad() {
		this.userId = parseInt(uni.getStorageSync('userId')) || 0
		if (!this.userId) {
			uni.showToast({ title: '请先登录', icon: 'none' })
			setTimeout(() => { uni.reLaunch({ url: '/pages/login/login' }) }, 1500)
			return
		}
		this.loadServiceTypes()
	},
	methods: {
		loadServiceTypes() {
			this.loading = true
			getWorkerServiceTypes(this.userId)
				.then(res => {
					if (res.code === 200) {
						this.selectedTypes = res.data || []
					}
				})
				.finally(() => { this.loading = false })
		},
		toggleService(serviceType) {
			const index = this.selectedTypes.indexOf(serviceType)
			if (index > -1) {
				this.selectedTypes.splice(index, 1)
			} else {
				this.selectedTypes.push(serviceType)
			}
		},
		saveServiceTypes() {
			this.saving = true
			setWorkerServiceTypes(this.userId, this.selectedTypes)
				.then(res => {
					if (res.code === 200) {
						uni.showToast({ title: '设置成功', icon: 'success' })
						setTimeout(() => { uni.navigateBack() }, 1500)
					}
				})
				.finally(() => { this.saving = false })
		}
	}
}
</script>

<style lang="scss" scoped>
.service-type-page {
	min-height: 100vh;
	background: #f8fafc;
	padding-bottom: 200rpx;
}

/* 顶部与头部设计 */
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

.section-tip {
	padding: 24rpx 10rpx;
	font-size: 26rpx;
	color: #64748b;
}

/* 服务卡片设计 */
.service-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.service-card {
	background: #ffffff;
	border-radius: 36rpx;
	padding: 40rpx;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 4rpx 20rpx rgba(149, 157, 165, 0.05);
	border: 2rpx solid transparent;

	&.active {
		border-color: #1890ff;
		background: #f0f7ff;
		box-shadow: 0 10rpx 30rpx rgba(24, 144, 255, 0.1);
	}

	.card-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.service-info {
		flex: 1;
		margin-right: 30rpx;
		.service-name {
			display: block;
			font-size: 34rpx;
			font-weight: bold;
			color: #1a1a1a;
			margin-bottom: 12rpx;
		}
		.service-desc {
			display: block;
			font-size: 24rpx;
			color: #8c8c8c;
			line-height: 1.5;
		}
	}
}

/* 自定义复选框 */
.custom-checkbox {
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	border: 2rpx solid #e2e8f0;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
	background: #fff;
	
	&.checked {
		background: #1890ff;
		border-color: #1890ff;
		color: #fff;
		font-size: 32rpx;
		font-weight: bold;
	}
}

/* 底部操作 */
.fixed-footer {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	background: #fff;
	padding: 30rpx 40rpx calc(30rpx + env(safe-area-inset-bottom));
	box-shadow: 0 -10rpx 40rpx rgba(0,0,0,0.05);
	z-index: 100;
	box-sizing: border-box;
}

.save-primary-btn {
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
	box-shadow: 0 12rpx 24rpx rgba(24, 144, 255, 0.3);
	
	&::after { border: none; }
	&[disabled] { opacity: 0.6; background: #ccc; box-shadow: none; }
}

/* 加载状态 */
.loading-state {
	padding: 100rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 24rpx;
	color: #94a3b8;
	font-size: 28rpx;
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
.animate-fade-in { animation: fadeIn 1s ease; }
</style>
