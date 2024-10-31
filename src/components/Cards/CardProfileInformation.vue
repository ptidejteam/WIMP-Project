<template>
	<!-- Profile Information Card -->
	<a-card :bordered="false" class="header-solid h-full card-profile-information"
		:bodyStyle="{ paddingTop: 0, paddingBottom: '16px' }" :headStyle="{ paddingRight: 0 }">
		<template #title>
			<h6 class="font-semibold m-0">Profile Information</h6>
		</template>

		<a-button type="link" slot="extra" @click="toggleEdit">
			<svg v-if="!isEditing" width="20" height="20" viewBox="0 0 20 20" fill="none"
				xmlns="http://www.w3.org/2000/svg">
				<path class="fill-muted"
					d="M13.5858 3.58579C14.3668 2.80474 15.6332 2.80474 16.4142 3.58579C17.1953 4.36683 17.1953 5.63316 16.4142 6.41421L15.6213 7.20711L12.7929 4.37868L13.5858 3.58579Z"
					fill="#111827" />
				<path class="fill-muted" d="M11.3787 5.79289L3 14.1716V17H5.82842L14.2071 8.62132L11.3787 5.79289Z"
					fill="#111827" />
			</svg>
			<svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path class="fill-muted" d="M15 5H5V15H15V5Z" fill="#111827" />
			</svg>
		</a-button>
		<!-- 
		<p class="text-dark my-2">
			Hi, I’m {{ profile.fullName }}. {{ profile.description }}
		</p> -->
		<hr class="my-25">

		<a-descriptions title="" :column="1" bordered>
			<a-descriptions-item label="Avatar">
				<template v-if="!isEditing">
					<img :src="profile.avatar" alt="Avatar" class="avatar-image" />
				</template>
				<template v-else>
					<a-select v-model="profile.avatar" style="width: 100%;">
						<a-select-option v-for="avatar in avatars" :key="avatar.value" :value="avatar.value">
							<img :src="avatar.value" alt="Avatar" class="avatar-dropdown-image"
								style="width: 20px; height: 20px; margin-right: 8px;" />
							{{ avatar.label }}
						</a-select-option>
					</a-select>
				</template>
			</a-descriptions-item>
			<a-descriptions-item label="Username">
				<template v-if="!isEditing">{{ profile.userName }}</template>
				<template v-else>
					<a-input style="width: 100%;" v-model="profile.userName" placeholder="Enter your username" />
				</template>
			</a-descriptions-item>

			<a-descriptions-item label="First Name">
				<template v-if="!isEditing">{{ profile.firstName }}</template>
				<template v-else>
					<a-input style="width: 100%;" v-model="profile.firstName" placeholder="Enter your first name" />
				</template>
			</a-descriptions-item>

			<a-descriptions-item label="Last Name">
				<template v-if="!isEditing">{{ profile.lastName }}</template>
				<template v-else>
					<a-input style="width: 100%;" v-model="profile.lastName" placeholder="Enter your last name" />
				</template>
			</a-descriptions-item>

			<a-descriptions-item label="Position">
				<template v-if="!isEditing">{{ profile.position }}</template>
				<template v-else>
					<a-input style="width: 100%;" v-model="profile.position" placeholder="Enter your position" />
				</template>
			</a-descriptions-item>

			<a-descriptions-item label="Birthday">
				<template v-if="!isEditing">{{ formatDate(profile.birthday) }}</template>
				<template v-else>
					<a-date-picker style="width: 100%;" v-model="profile.birthday" />
				</template>
			</a-descriptions-item>

			<a-descriptions-item label="Email Status">
				<template v-if="!isEditing">
					{{ profile.email }}
				</template>
				<template v-else>
					<a-input style="width: 100%;" v-model="profile.email" placeholder="Enter your email" />
				</template>
			</a-descriptions-item>



			<a-descriptions-item label="Permission Level">
				<template v-if="!isEditing">
					<a-tag :color="getTagColor(profile.permissionLevel)">
						{{ GetPermissionLevel(profile.permissionLevel) }}
					</a-tag>
				</template>
				<template v-else>
					<a-select v-model="profile.permissionLevel" @change="checkPermissionLevel" style="width: 100%;"
						v-if="profile.permissionLevel === Role.Master">
						<a-select-option v-for="role in availableRoles" :key="role.value" :value="role.value">
							{{ role.label }}
						</a-select-option>
					</a-select>
					<a-tag v-else :color="getTagColor(profile.permissionLevel)">
						{{ GetPermissionLevel(profile.permissionLevel) }}
					</a-tag>
				</template>
			</a-descriptions-item>

			<a-descriptions-item label="Account Status">
				<template v-if="!isEditing">
					<span :class="['account-status', profile.isActive ? 'active' : 'inactive']">
						{{ profile.isActive ? 'Active' : 'Inactive' }}
					</span>
				</template>
				<template v-else>
					<a-switch v-if="profile.permissionLevel === Role.Master" v-model="profile.isActive" />
					<span v-else :class="['account-status', profile.isActive ? 'active' : 'inactive']">
						{{ profile.isActive ? 'Active' : 'Inactive' }}
					</span>
				</template>
			</a-descriptions-item>

			<a-descriptions-item label="Created At">
				<template>{{ formatDate(profile.createdAt) }}</template>
			</a-descriptions-item>

			<a-descriptions-item label="Updated At">
				<template>{{ formatDate(profile.updatedAt) }}</template>
			</a-descriptions-item>
		</a-descriptions>
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
			profile: {
				fullName: "",
				description: "Decisions: If you can’t decide, the answer is no...",
				userName: "",
				firstName: "",
				lastName: "",
				position: "Student", // New field
				avatar: "images/face-1.jpg", // New field
				// emailStatus: "pending", // New field
				birthday: null,
				isActive: true,
				createdAt: null,
				updatedAt: null,
				permissionLevel: Role.Surfer, // Default permission level
			},
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
			this.checkPermissionLevel(newRole, oldRole);
		},
	},

	methods: {
		toggleEdit() {
			this.isEditing = !this.isEditing;
			if (!this.isEditing) {
				this.saveProfile(); // Save profile when exiting edit mode
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
		checkPermissionLevel(newLevel) {
			// Handle permission level changes
			// This could involve showing/hiding certain fields or enabling/disabling features
			console.log(`Permission level changed from ${this.profile.permissionLevel} to ${newLevel}`);
		},
	},
};
</script>

<style scoped>
.avatar-image {
	width: 40px;
	height: 40px;
	border-radius: 50%;
}

.account-status {
	font-weight: bold;
}

.account-status.active {
	color: green;
}

.account-status.inactive {
	color: red;
}
</style>