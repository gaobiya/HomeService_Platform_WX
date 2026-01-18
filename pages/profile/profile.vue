<template>
	<view class="profile-container">
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="avatar-section" @click="changeAvatar">
				<image 
					class="avatar" 
					:src="userInfo.avatarUrl || '/static/default-avatar.png'" 
					mode="aspectFill"
				></image>
				<text class="change-avatar-tip">点击更换头像</text>
			</view>
			<view class="user-info">
				<text class="username">{{ userInfo.username || '未设置' }}</text>
				<text class="role">{{ getRoleName(userInfo.role) }}</text>
			</view>
		</view>
		
		<!-- 个人信息 -->
		<view class="info-section">
			<view class="section-title">个人信息</view>
			<view class="info-item">
				<text class="label">用户名</text>
				<input 
					class="value-input" 
					v-model="editForm.username" 
					placeholder="请输入用户名"
					maxlength="20"
				/>
			</view>
			<view class="info-item">
				<text class="label">手机号</text>
				<input 
					class="value-input" 
					v-model="editForm.phone" 
					placeholder="请输入手机号"
					type="number"
					maxlength="11"
				/>
			</view>
			<view class="info-item">
				<text class="label">注册时间</text>
				<text class="value">{{ formatDateTime(userInfo.createdAt) }}</text>
			</view>
		</view>
		
		<!-- 修改密码 -->
		<view class="info-section">
			<view class="section-title">修改密码</view>
			<view class="info-item">
				<text class="label">原密码</text>
				<input 
					class="value-input" 
					v-model="passwordForm.oldPassword" 
					placeholder="请输入原密码"
					password
					maxlength="20"
				/>
			</view>
			<view class="info-item">
				<text class="label">新密码</text>
				<input 
					class="value-input" 
					v-model="passwordForm.newPassword" 
					placeholder="请输入新密码（6-20个字符）"
					password
					maxlength="20"
				/>
			</view>
			<view class="info-item">
				<text class="label">确认新密码</text>
				<input 
					class="value-input" 
					v-model="passwordForm.confirmPassword" 
					placeholder="请再次输入新密码"
					password
					maxlength="20"
				/>
			</view>
		</view>
		
		<!-- 服务员专属功能 -->
		<view class="info-section" v-if="userInfo.role === 'worker'">
			<view class="section-title">服务管理</view>
			<view class="menu-item" @click="goToServiceTypes">
				<text class="menu-label">服务项目设置</text>
				<text class="menu-arrow">></text>
			</view>
			<view class="menu-item" @click="goToSchedule">
				<text class="menu-label">日程管理</text>
				<text class="menu-arrow">></text>
			</view>
		</view>
		
		<!-- 操作按钮 -->
		<view class="action-buttons">
			<button class="save-btn" @click="saveUserInfo" :disabled="saving">
				{{ saving ? '保存中...' : '保存个人信息' }}
			</button>
			<button class="change-password-btn" @click="changePassword" :disabled="changingPassword">
				{{ changingPassword ? '修改中...' : '修改密码' }}
			</button>
			<button class="logout-btn" @click="handleLogout">退出登录</button>
		</view>
	</view>
</template>

<script>
import { getUserInfo, updateUser, changePassword, uploadAvatar } from '../../api/user'

export default {
	data() {
		return {
			userInfo: {},
			editForm: {
				username: '',
				phone: ''
			},
			passwordForm: {
				oldPassword: '',
				newPassword: '',
				confirmPassword: ''
			},
			saving: false,
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
				uni.reLaunch({
					url: '/pages/login/login'
				})
				return
			}
			
			getUserInfo(userId)
				.then(res => {
					if (res.code === 200) {
						this.userInfo = res.data
						this.editForm.username = res.data.username || ''
						this.editForm.phone = res.data.phone || ''
					}
				})
				.catch(err => {
					console.error('加载用户信息失败:', err)
				})
		},
		changeAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const tempFilePath = res.tempFilePaths[0]
					this.uploadAvatarFile(tempFilePath)
				}
			})
		},
		uploadAvatarFile(filePath) {
			uni.showLoading({
				title: '上传中...'
			})
			
			const userId = uni.getStorageSync('userId')
			uni.uploadFile({
				url: 'http://localhost:8080/api/user/upload-avatar',
				filePath: filePath,
				name: 'file',
				formData: {
					userId: userId
				},
				header: {
					'Authorization': `Bearer ${uni.getStorageSync('token')}`
				},
				success: (res) => {
					try {
						const data = JSON.parse(res.data)
						if (data.code === 200) {
							this.userInfo.avatarUrl = data.data.avatarUrl
							uni.showToast({
								title: '头像上传成功',
								icon: 'success'
							})
							this.loadUserInfo()
						} else {
							uni.showToast({
								title: data.message || '上传失败',
								icon: 'none'
							})
						}
					} catch (e) {
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						})
					}
				},
				fail: (err) => {
					console.error('上传失败:', err)
					uni.showToast({
						title: '上传失败',
						icon: 'none'
					})
				},
				complete: () => {
					uni.hideLoading()
				}
			})
		},
		saveUserInfo() {
			if (!this.editForm.username.trim()) {
				uni.showToast({
					title: '请输入用户名',
					icon: 'none'
				})
				return
			}
			
			if (this.editForm.phone && !/^1[3-9]\d{9}$/.test(this.editForm.phone)) {
				uni.showToast({
					title: '手机号格式不正确',
					icon: 'none'
				})
				return
			}
			
			this.saving = true
			const updateData = {
				id: this.userInfo.id,
				username: this.editForm.username,
				phone: this.editForm.phone,
				avatarUrl: this.userInfo.avatarUrl
			}
			
			updateUser(updateData)
				.then(res => {
					if (res.code === 200) {
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						})
						uni.setStorageSync('username', this.editForm.username)
						this.loadUserInfo()
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
		},
		changePassword() {
			if (!this.passwordForm.oldPassword) {
				uni.showToast({
					title: '请输入原密码',
					icon: 'none'
				})
				return
			}
			
			if (!this.passwordForm.newPassword) {
				uni.showToast({
					title: '请输入新密码',
					icon: 'none'
				})
				return
			}
			
			if (this.passwordForm.newPassword.length < 6 || this.passwordForm.newPassword.length > 20) {
				uni.showToast({
					title: '新密码长度必须在6-20个字符之间',
					icon: 'none'
				})
				return
			}
			
			if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
				uni.showToast({
					title: '两次输入的密码不一致',
					icon: 'none'
				})
				return
			}
			
			this.changingPassword = true
			changePassword({
				userId: this.userInfo.id,
				oldPassword: this.passwordForm.oldPassword,
				newPassword: this.passwordForm.newPassword
			})
				.then(res => {
					if (res.code === 200) {
						uni.showToast({
							title: '密码修改成功',
							icon: 'success'
						})
						this.passwordForm = {
							oldPassword: '',
							newPassword: '',
							confirmPassword: ''
						}
					}
				})
				.catch(err => {
					console.error('修改密码失败:', err)
					uni.showToast({
						title: err.message || '修改密码失败',
						icon: 'none'
					})
				})
				.finally(() => {
					this.changingPassword = false
				})
		},
		handleLogout() {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						uni.removeStorageSync('token')
						uni.removeStorageSync('userId')
						uni.removeStorageSync('role')
						uni.removeStorageSync('username')
						uni.reLaunch({
							url: '/pages/login/login'
						})
					}
				}
			})
		},
		goToServiceTypes() {
			uni.navigateTo({
				url: '/pages/worker/service-types'
			})
		},
		goToSchedule() {
			uni.navigateTo({
				url: '/pages/worker/schedule'
			})
		},
		getRoleName(role) {
			const map = {
				'customer': '客户',
				'worker': '服务员'
			}
			return map[role] || role
		},
		formatDateTime(dateTime) {
			if (!dateTime) return ''
			return new Date(dateTime).toLocaleString('zh-CN')
		}
	}
}
</script>

<style scoped>
.profile-container {
	min-height: 100vh;
	background: #F5F5F5;
	padding-bottom: 40rpx;
}

.user-card {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 60rpx 40rpx;
	color: #fff;
	display: flex;
	align-items: center;
}

.avatar-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-right: 40rpx;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	border: 4rpx solid rgba(255, 255, 255, 0.5);
	margin-bottom: 10rpx;
}

.change-avatar-tip {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.8);
}

.user-info {
	flex: 1;
}

.username {
	display: block;
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
}

.role {
	display: block;
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.8);
}

.info-section {
	background: #fff;
	margin: 20rpx;
	border-radius: 20rpx;
	padding: 30rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 2rpx solid #eee;
}

.info-item {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
	border-bottom: none;
}

.label {
	width: 150rpx;
	font-size: 28rpx;
	color: #666;
}

.value {
	flex: 1;
	font-size: 28rpx;
	color: #333;
}

.value-input {
	flex: 1;
	font-size: 28rpx;
	color: #333;
}

.action-buttons {
	padding: 0 40rpx;
	margin-top: 40rpx;
}

.save-btn, .change-password-btn, .logout-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 10rpx;
	font-size: 32rpx;
	border: none;
	margin-bottom: 20rpx;
}

.save-btn {
	background: #1890FF;
	color: #fff;
}

.change-password-btn {
	background: #52C41A;
	color: #fff;
}

.logout-btn {
	background: #FF4D4F;
	color: #fff;
}

.save-btn[disabled], .change-password-btn[disabled] {
	background: #ccc;
}

.menu-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 0;
	border-bottom: 1rpx solid #F0F0F0;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-label {
	font-size: 28rpx;
	color: #333;
}

.menu-arrow {
	font-size: 28rpx;
	color: #999;
}
</style>
