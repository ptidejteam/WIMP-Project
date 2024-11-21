<template>
	<a-card :bodyStyle="{ padding: '16px' }" :bordered="true">

		<!-- Title Section -->
		<template #title>
			<div class="profile-header">
				<h6 class="font-semibold">Profile Information</h6>
				<a-button type="link" class="edit-button" @click="toggleEdit">
					<span v-if="!isEditing">Edit</span>
					<span v-else>Save</span>
				</a-button>
			</div>

		</template>
		<!-- Descriptive Text -->
		<p class="text-muted description-text">
			Here you can view and edit your profile information, including your username, avatar, and other personal
			details.
			Click the edit button to update your profile.
		</p>
		<template v-if="!profile">
			<a-skeleton />
		</template>
		<template v-else>
			<!-- Profile Content -->
			<div class="info">
				<a-descriptions :column="1" bordered>
					<a-descriptions-item label="Avatar">
						<div v-if="!isEditing" class="avatar-section">
							<img :src="profile.avatar" alt="Avatar" class="avatar-image" />
						</div>
						<a-select v-else v-model="profile.avatar" style="width: 100%;">
							<a-select-option v-for="avatar in avatars" :key="avatar.value" :value="avatar.value">
								<img :src="avatar.value" alt="Avatar" class="avatar-dropdown-image" />
								{{ avatar.label }}
							</a-select-option>
						</a-select>
					</a-descriptions-item>

					<a-descriptions-item label="Username">
						<template v-if="!isEditing">{{ profile.userName || "Not Set" }}</template>
						<a-input v-else v-model="profile.userName" placeholder="Enter your username" />
					</a-descriptions-item>

					<a-descriptions-item label="Full Name">
						<template v-if="!isEditing">{{ profile.firstName || "N/A" }} {{ profile.lastName || ""
							}}</template>
						<div v-else>
							<a-input v-model="profile.firstName" placeholder="First Name" style="margin-bottom: 8px;" />
							<a-input v-model="profile.lastName" placeholder="Last Name" />
						</div>
					</a-descriptions-item>

					<a-descriptions-item label="Position">
						<template v-if="!isEditing">{{ profile.position || "Not Set" }}</template>
						<a-input v-else v-model="profile.position" placeholder="Enter your position" />
					</a-descriptions-item>

					<a-descriptions-item label="Birthday">
						<template v-if="!isEditing">{{ formatDate(profile.birthday) }}</template>
						<a-date-picker v-else v-model="profile.birthday" style="width: 100%;" />
					</a-descriptions-item>

					<a-descriptions-item label="Email">
						<template v-if="!isEditing">{{ profile.email || "Not Set" }}</template>
						<a-input v-else v-model="profile.email" placeholder="Enter your email" />
					</a-descriptions-item>

					<a-descriptions-item label="Role">
						<template v-if="!isEditing">
							<a-tag :color="getTagColor(profile.permissionLevel)">
								{{ GetPermissionLevel(profile.permissionLevel) }}
							</a-tag>
						</template>
						<a-select v-else v-model="profile.permissionLevel" style="width: 100%;">
							<a-select-option v-for="role in availableRoles" :key="role.value" :value="role.value">
								{{ role.label }}
							</a-select-option>
						</a-select>
					</a-descriptions-item>

					<a-descriptions-item label="Account Status">
						<template v-if="!isEditing">
							<span :class="['account-status', profile.isActive ? 'active' : 'inactive']">
								{{ profile.isActive ? "Active" : "Inactive" }}
							</span>
						</template>
						<a-switch v-else v-model="profile.isActive" />
					</a-descriptions-item>
				</a-descriptions>
				<!-- Connectivity Notifications Section -->
				<div class="connectivity-notifications">
					<h6 class="font-semibold">Connectivity Notifications</h6>
					<p class="text-muted">
						Manage notifications related to connectivity status. Turn this setting on to receive alerts when
						your
						device is offline or reconnects.
					</p>
					<a-switch v-model="notificationsEnabled" checked-children="On" unchecked-children="Off"
						@change="toggleConnectivityNotifications" />
				</div>
				<!-- Privacy Section -->
				<div class="privacy-section">
					<h6 class="font-semibold">Privacy</h6>
					<p class="text-muted">
						By using this platform, you consent to the collection and use of your data as described in our
						privacy
						policy. You can review your consent status below and clear your profile data if desired.
					</p>
					<p>
						<b>Consent Status:</b> {{ consentGiven ? "Given" : "Not Given" }}
					</p>
					<a-button type="default" class="consent-button" @click="toggleConsent">
						{{ consentGiven ? "Revoke Consent" : "Give Consent" }}
					</a-button>
					<a-button type="danger" class="clear-data-button" @click="clearProfileData">
						Clear Profile Data
					</a-button>
				</div>
			</div>

		</template>

	</a-card>
</template>
<script>
import { AuthenticationService } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import { Role } from "../../helpers/roles";

export default {
	data() {
		return {
			isEditing: false,
			consentGiven: true, // Tracks consent status
			notificationsEnabled: true, // Tracks the state of connectivity notifications
			profile: null,
			avatars: [
				{ value: 'images/face-1.jpg', label: 'Face 1' },
				{ value: 'images/face-2.jpg', label: 'Face 2' },
				{ value: 'images/face-3.jpg', label: 'Face 3' },
				{ value: 'images/face-4.jpg', label: 'Face 4' },
				// add more avatars as needed...
			],
			Role: Role,
			availableRoles: [
				{ value: Role.Surfer, label: 'Surfer' },
				{ value: Role.Member, label: 'Member' },
				{ value: Role.Master, label: 'Master' },
			],
		};
	},

	created() {
		this.loadUserProfile();
	},

	watch: {
		'profile.permissionLevel'(newRole, oldRole) {
			//this.checkPermissionLevel(newRole, oldRole);
		},
	},

	methods: {

		clearProfileData() {
			this.$confirm({
				title: 'Are you sure you want to clear your profile data?',
				content: 'This action cannot be undone.',
				okText: 'Yes',
				okType: 'danger',
				cancelText: 'No',
				onOk: () => {
					this.profile = null;
					this.$message.success('Profile data has been cleared.');
				},
				onCancel() {
					this.$message.info('Action cancelled.');
				},
			});
		},
		toggleEdit() {
			this.isEditing = !this.isEditing;
			if (!this.isEditing) {
				this.saveProfile(); // Save profile when exiting edit mode
			}
		},
		addWorkspace() {
			if (this.newWorkspaceName.trim()) {
				this.workSpaces.push({
					id: this.workSpaces.length + 1, // Simple ID generator
					name: this.newWorkspaceName.trim(),
				});
				this.newWorkspaceName = ''; // Clear the input field
			} else {
				this.$message.error('Workspace name cannot be empty.');
			}
		},
		GetPermissionLevel(permission) {
			switch (permission) {
				case Role.Surfer:
					return "Surfer";
				case Role.Member:
					return "Member";
				case Role.Master:
					return "Master";
				default:
					return "Unknown";
			}
		},

		async loadUserProfile() {
			try {
				const userId = AuthenticationService.currentUserValue["userId"];
				const userProfile = await userService.getById(userId);
				this.profile = {
					...this.profile,
					...userProfile.data,
				};
				//console.log(userProfile.data);
			} catch (error) {
				this.$message.error("Failed to load user profile: " + error.message);
			}
		},

		async saveProfile() {
			try {
				const userId = AuthenticationService.currentUserValue["userId"];
				const userProfile = await userService.putUser(userId, this.profile);
				this.profile = {
					...this.profile,
					...userProfile.data,
				};

				this.isEditing = false;
				this.$message.success("User profile saved successfully");
			} catch (error) {
				this.$message.error("Failed to save profile: " + error.message);
			}
		},

		formatDate(dateString) {
			if (!dateString) return 'N/A'; // Handle case where date is null
			const options = { year: 'numeric', month: 'long', day: 'numeric' };
			return new Date(dateString).toLocaleDateString(undefined, options);
		},

		getEmailStatusColor(status) {
			switch (status) {
				case 'pending':
					return 'orange';
				case 'sent':
					return 'green';
				case 'failed':
					return 'red';
				default:
					return 'gray';
			}
		},
		getTagColor(permissionLevel) {
			switch (permissionLevel) {
				case Role.Surfer:
					return 'red';
				case Role.Member:
					return 'orange';
				case Role.Master:
					return 'green';
				default:
					return 'gray';
			}
		},
	},
};
</script>

<style scoped>
.info {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.workspace-list {
	list-style-type: none;
	padding: 0;
}

.workspace-item {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
}

.delete-btn {
	color: red;
}

.profile-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.edit-button {
	color: #1890ff;
	cursor: pointer;
}

.avatar-image {
	width: 40px;
	height: 40px;
	border-radius: 50%;
}
.privacy-section,
.connectivity-notifications {
	margin-top: 24px;
	padding: 16px;
	background-color: #fafafa;
	border: 1px solid #f0f0f0;
	border-radius: 4px;
}

.privacy-section {
	margin-top: 24px;
	padding: 16px;
	background-color: #fafafa;
	border: 1px solid #f0f0f0;
	border-radius: 4px;
}

.privacy-section h6 {
	margin-bottom: 12px;
}

.clear-data-button,
.consent-button {
	margin-top: 12px;
	margin-right: 8px;
}

.avatar-dropdown-image {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	margin-right: 8px;
}

.account-status.active {
	color: green;
}

.account-status.inactive {
	color: red;
}

.privacy-section {
	margin-top: 16px;
	padding-top: 16px;
	border-top: 1px solid #f0f0f0;
}
</style>
