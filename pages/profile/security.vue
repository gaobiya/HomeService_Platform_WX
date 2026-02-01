<template>
	<view class="security-page">
		<view class="page-content scroll-body">
			<view class="info-card animate-slide-up">
				<view class="card-header">
					<text class="title">安全设置</text>
				</view>
				<view class="info-group">
					<view class="form-item">
						<text class="label">原始密码</text>
						<input 
							class="value-input" 
							v-model="passwordForm.oldPassword" 
							placeholder="请输入旧密码"
							password
						/>
					</view>
					<view class="form-item">
						<text class="label">新设密码</text>
						<input 
							class="value-input" 
							v-model="passwordForm.newPassword" 
							placeholder="6-20位新密码"
							password
						/>
					</view>
					<view class="form-item no-border">
						<text class="label">重复新密码</text>
						<input 
							class="value-input" 
							v-model="passwordForm.confirmPassword" 
							placeholder="再次确认新密码"
							password
						/>
					</view>
				</view>
				<button class="ghost-btn-blue" @click="changePassword" :disabled="changingPassword">
					{{ changingPassword ? '处理中...' : '更新登录密码' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import { getUserInfo, changePassword as apiChangePassword } from '../../api/user'

export default {
	data() {
		return {
			userInfo: {},
			passwordForm: {
				oldPassword: '',
				newPassword: '',
				confirmPassword: ''
			},
			changingPassword: false
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
				if (res.code === 200) this.userInfo = res.data
			})
		},
		changePassword() {
			if (!this.passwordForm.oldPassword) {
				uni.showToast({ title: '请输入旧密码', icon: 'none' })
				return
			}
			if (!this.passwordForm.newPassword) {
				uni.showToast({ title: '新密码不能为空', icon: 'none' })
				return
			}
			if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
				uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
				return
			}
			this.changingPassword = true
			apiChangePassword({
				userId: this.userInfo.id,
				oldPassword: this.passwordForm.oldPassword,
				newPassword: this.passwordForm.newPassword
			}).then(res => {
				if (res.code === 200) {
					uni.showToast({ title: '密码已修改', icon: 'success' })
					this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' }
				}
			}).finally(() => { this.changingPassword = false })
		}
	}
}
</script>

<style lang="scss" scoped>
.security-page {
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
	.value-input {
		flex: 1;
		font-size: 28rpx;
		color: #1e293b;
	}
}

.ghost-btn-blue {
	margin-top: 30rpx;
	height: 84rpx;
	line-height: 84rpx;
	background: #ebf5ff;
	color: #1890ff;
	border-radius: 42rpx;
	font-size: 28rpx;
	font-weight: 500;
	border: none;
}

@keyframes slideUp {
	from { opacity: 0; transform: translateY(30rpx); }
	to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up { animation: slideUp 0.6s ease-out; }
</style>
