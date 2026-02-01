<template>
	<view class="basic-info-page">
		<view class="page-content scroll-body">
			<view class="info-card animate-slide-up">
				<view class="card-header">
					<text class="title">基本资料</text>
				</view>
				<view class="info-group">
					<view class="form-item">
						<text class="label">用户名</text>
						<input 
							class="value-input" 
							v-model="editForm.username" 
							placeholder="点击设置用户名"
							placeholder-style="color: #ccc"
							maxlength="20"
						/>
					</view>
					<view class="form-item">
						<text class="label">联系电话</text>
						<input 
							class="value-input" 
							v-model="editForm.phone" 
							placeholder="绑定手机号"
							placeholder-style="color: #ccc"
							type="number"
							maxlength="11"
						/>
					</view>
					<view class="form-item no-border">
						<text class="label">加入时间</text>
						<text class="static-value">{{ formatDateTime(userInfo.createdAt) }}</text>
					</view>
				</view>
				<button class="save-primary-btn" @click="saveUserInfo" :disabled="saving">
					{{ saving ? '保存中...' : '提交修改' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import { getUserInfo, updateUser } from '../../api/user'

export default {
	data() {
		return {
			userInfo: {},
			editForm: {
				username: '',
				phone: ''
			},
			saving: false
		}
	},
	onLoad() {
		this.loadUserInfo()
	},
	methods: {
		loadUserInfo() {
			const userId = uni.getStorageSync('userId')
			if (!userId) {
				uni.reLaunch({ url: '/pages/login/login' })
				return
			}
			getUserInfo(userId).then(res => {
				if (res.code === 200) {
					this.userInfo = res.data
					this.editForm.username = res.data.username || ''
					this.editForm.phone = res.data.phone || ''
				}
			})
		},
		saveUserInfo() {
			if (!this.editForm.username.trim()) {
				uni.showToast({ title: '用户名不能为空', icon: 'none' })
				return
			}
			this.saving = true
			updateUser({
				id: this.userInfo.id,
				username: this.editForm.username,
				phone: this.editForm.phone,
				avatarUrl: this.userInfo.avatarUrl
			}).then(res => {
				if (res.code === 200) {
					uni.showToast({ title: '资料已更新', icon: 'success' })
					uni.setStorageSync('username', this.editForm.username)
				}
			}).finally(() => { this.saving = false })
		},
		formatDateTime(dateTime) {
			if (!dateTime) return '-'
			const d = new Date(dateTime)
			return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
		}
	}
}
</script>

<style lang="scss" scoped>
.basic-info-page {
	min-height: 100vh;
	background: #f8fafc;
}

.page-content {
	padding: 30rpx;
}

.info-card {
	background: #ffffff;
	border-radius: 36rpx;
	padding: 40rpx;
	box-shadow: 0 8rpx 24rpx rgba(149, 157, 165, 0.05);
}

.card-header {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
	.title { font-size: 30rpx; font-weight: bold; color: #333; }
}

.form-item {
	display: flex;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 1px solid #f1f5f9;
	&.no-border { border-bottom: none; }
	.label {
		width: 160rpx;
		font-size: 28rpx;
		color: #64748b;
	}
	.value-input, .static-value {
		flex: 1;
		font-size: 28rpx;
		color: #1e293b;
	}
}

.save-primary-btn {
	margin-top: 30rpx;
	height: 84rpx;
	line-height: 84rpx;
	background: linear-gradient(90deg, #1890ff, #40a9ff);
	color: #fff;
	border-radius: 42rpx;
	font-size: 28rpx;
	font-weight: bold;
	border: none;
}

@keyframes slideUp {
	from { opacity: 0; transform: translateY(30rpx); }
	to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up { animation: slideUp 0.6s ease-out; }
</style>
