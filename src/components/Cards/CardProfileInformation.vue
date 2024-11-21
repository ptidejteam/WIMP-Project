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

		<!-- Description -->
		<p class="text-muted description-text">
			Here you can view and edit your profile information. Click the edit button to update your details.
		</p>

		<template v-if="!profile">
			<a-skeleton />
		</template>
		<template v-else>
			<!-- Profile Details -->
			<div class="info">
				<a-descriptions :column="1" bordered>
					<a-descriptions-item label="Avatar">
						<template v-if="!isEditing">
							<img :src="profile.avatar" alt="Avatar" class="avatar-image" />
						</template>
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
						<template v-if="!isEditing">
							{{ profile.firstName || "N/A" }} {{ profile.lastName || "" }}
						</template>
						<div v-else>
							<a-input v-model="profile.firstName" placeholder="First Name" />
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

				<!-- Connectivity Notifications -->
				<div class="section">
					<div style="display: flex;    justify-content: space-between;">
						<h6 class="font-semibold">Connectivity Notifications</h6>
						<a-switch v-model="notificationsEnabled" checked-children="On" unchecked-children="Off" />

					</div>

					<p class="text-muted">
						Turn this setting on to receive alerts for connectivity changes.
					</p>
				</div>

				<!-- Privacy Section -->
				<div class="section">
					<h6 class="font-semibold">Privacy</h6>
					<p class="text-muted">
						By using this platform, you consent to the collection and use of your data as described in our
						privacy
						policy. You can review your consent status below and clear your profile data if desired. </p>
					<p><b>Consent Status:</b> {{ consentGiven ? "Given" : "Not Given" }}</p>
					<a-button type="default" @click="toggleConsent">
						{{ consentGiven ? "Revoke Consent" : "Give Consent" }}
					</a-button>
					<a-button type="danger" @click="clearProfileData">
						Clear Profile Data
					</a-button>
				</div>
			</div>
		</template>
	</a-card>
</template>

<script>
import { AuthenticationService } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import { Role } from "../../helpers/roles";

export default {
	data() {
		return {
			isEditing: false,
			consentGiven: true,
			notificationsEnabled: true,
			profile: null,
			avatars: [
				{ value: "images/face-1.jpg", label: "Face 1" },
				{ value: "images/face-2.jpg", label: "Face 2" },
				{ value: "images/face-3.jpg", label: "Face 3" },
				{ value: "images/face-4.jpg", label: "Face 4" },
			],
			availableRoles: [
				{ value: Role.Surfer, label: "Surfer" },
				{ value: Role.Member, label: "Member" },
				{ value: Role.Master, label: "Master" },
			],
		};
	},
	created() {
		this.loadUserProfile();
	},
	methods: {
		async loadUserProfile() {
			try {
				const userId = AuthenticationService.currentUserValue.userId;
				const userProfile = await userService.getById(userId);
				this.profile = { ...userProfile.data };
			} catch (error) {
				this.$message.error("Failed to load user profile.");
			}
		},
		async saveProfile() {
			try {
				const userId = AuthenticationService.currentUserValue.userId;
				await userService.putUser(userId, this.profile);
				this.$message.success("Profile updated successfully.");
			} catch (error) {
				this.$message.error("Failed to save profile.");
			}
		},
		toggleEdit() {
			this.isEditing = !this.isEditing;
			if (!this.isEditing) this.saveProfile();
		},
		clearProfileData() {
			this.$confirm({
				title: "Clear profile data?",
				content: "This action cannot be undone.",
				onOk: () => {
					this.profile = null;
					this.$message.success("Profile data cleared.");
				},
			});
		},
		toggleConsent() {
			this.consentGiven = !this.consentGiven;
			this.$message.info(`Consent ${this.consentGiven ? "given" : "revoked"}.`);
		},
		formatDate(date) {
			return date ? new Date(date).toLocaleDateString() : "N/A";
		},
		GetPermissionLevel(level) {
			return this.availableRoles.find((role) => role.value === level)?.label || "Unknown";
		},
		getTagColor(level) {
			return {
				[Role.Surfer]: "red",
				[Role.Member]: "orange",
				[Role.Master]: "green",
			}[level] || "gray";
		},
	},
};
</script>

<style scoped>
.profile-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.avatar-image,
.avatar-dropdown-image {
	width: 40px;
	height: 40px;
	border-radius: 50%;
}

.section {
	margin-top: 24px;
	padding: 16px;
	background: #fafafa;
	border: 1px solid #f0f0f0;
	border-radius: 4px;
}

.account-status.active {
	color: green;
}

.account-status.inactive {
	color: red;
}

.ant-descriptions .ant-descriptions-row>th,
.ant-descriptions .ant-descriptions-row>td {
	padding-bottom: 0px;
}
</style>