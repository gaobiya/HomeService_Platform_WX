<template>
	<view class="container">
		<view class="header">
			<text class="title">我的服务项目</text>
			<text class="subtitle">选择您可提供的服务类型，用于自动派单匹配</text>
		</view>
		
		<view class="service-list" v-if="!loading">
			<view 
				class="service-item" 
				v-for="(item, index) in serviceTypes" 
				:key="index"
				@click="toggleService(item.value)"
			>
				<view class="service-info">
					<text class="service-name">{{ item.label }}</text>
					<text class="service-desc">{{ item.desc }}</text>
				</view>
				<checkbox 
					:checked="selectedTypes.includes(item.value)" 
					@click.stop="toggleService(item.value)"
					color="#1890FF"
				/>
			</view>
		</view>
		
		<view class="loading" v-if="loading">
			<text>加载中...</text>
		</view>
		
		<view class="empty" v-if="!loading && serviceTypes.length === 0">
			<text>暂无服务类型</text>
		</view>
		
		<button class="save-btn" @click="saveServiceTypes" :disabled="saving || loading">
			{{ saving ? '保存中...' : '保存设置' }}
		</button>
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
				{ value: 'cleaning', label: '保洁服务', desc: '家庭清洁、深度保洁' },
				{ value: 'repair', label: '维修服务', desc: '家电维修、管道维修' },
				{ value: 'cooking', label: '做饭服务', desc: '家庭烹饪、营养配餐' },
				{ value: 'babysitting', label: '育儿服务', desc: '儿童看护、早教辅导' }
			]
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
				.catch(err => {
					console.error('加载服务类型失败:', err)
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					})
				})
				.finally(() => {
					this.loading = false
				})
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
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						})
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					}
				})
				.catch(err => {
					console.error('保存失败:', err)
					uni.showToast({
						title: err.message || '保存失败',
						icon: 'none'
					})
				})
				.finally(() => {
					this.saving = false
				})
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background-color: #F5F5F5;
	padding: 20rpx;
}

.header {
	padding: 30rpx 20rpx;
	background-color: #fff;
	border-radius: 10rpx;
	margin-bottom: 20rpx;
}

.title {
	display: block;
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
}

.subtitle {
	display: block;
	font-size: 28rpx;
	color: #999;
}

.service-list {
	background-color: #fff;
	border-radius: 10rpx;
	overflow: hidden;
	margin-bottom: 30rpx;
}

.service-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 20rpx;
	border-bottom: 1rpx solid #F0F0F0;
}

.service-item:last-child {
	border-bottom: none;
}

.service-info {
	flex: 1;
}

.service-name {
	display: block;
	font-size: 32rpx;
	color: #333;
	margin-bottom: 8rpx;
}

.service-desc {
	display: block;
	font-size: 24rpx;
	color: #999;
}

.save-btn {
	width: 100%;
	height: 88rpx;
	background-color: #1890FF;
	color: #fff;
	border-radius: 10rpx;
	font-size: 32rpx;
	line-height: 88rpx;
	text-align: center;
	border: none;
}

.save-btn[disabled] {
	background-color: #ccc;
}

.loading {
	text-align: center;
	padding: 100rpx 0;
	color: #999;
	font-size: 28rpx;
}

.empty {
	text-align: center;
	padding: 100rpx 0;
	color: #999;
	font-size: 28rpx;
}
</style>
