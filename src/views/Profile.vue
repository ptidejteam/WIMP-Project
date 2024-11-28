<!-- 
	This is the user profile page, it uses the dashboard layout in: 
	"./layouts/Dashboard.vue" .
 -->
<template>
	<a-spin :spinning="!user">
		<div>
			<!-- Header Background -->
			<template v-if="!user">
				<!-- Loading or fallback content can go here if needed -->
			</template>

			<template v-else>
				<div class="profile-nav-bg"></div>

				<!-- User Profile Card -->
				<a-card :bordered="false" class="card-profile-head" :bodyStyle="{ padding: 0 }">
					<template #title>
						<a-row type="flex" align="middle">
							<a-col :span="24" :md="12" class="col-info">
								<div class="avatar-container">
									<a-avatar :size="120" shape="square" :src="user.avatar || defaultAvatar" />
									<div class="avatar-overlay">
										<label class="upload-label">
											<input type="file" @change="onPhotoChange" accept="image/*"
												class="upload-input" />
											<span class="upload-text">Change Profile Photo</span>
										</label>
									</div>
								</div>
								<div class="avatar-info">
									<h4 class="font-semibold m-0">Hello, {{ user.name }}!</h4>
									<p>{{ user.position }}</p>
								</div>
							</a-col>

							<a-col :span="24" :md="12" class="right-section">
								<div class="quote-section">
									<p class="quote-text">
										<em>"The only way to do great work is to love what you do." – Steve Jobs</em>
									</p>
								</div>
							</a-col>
						</a-row>
					</template>
				</a-card>

				<!-- Profile Content -->
				<a-row type="flex" :gutter="24" align="stretch">
					<!-- Profile Information -->
					<a-col :span="24" :md="8" class="profile-column">
						<CardProfileInformation @profile-updated="onProfileUpdated"
							@google-connectivity="onGoogleConnectivity" />
					</a-col>

					<!-- Conditional Cards Based on User Role -->
					<a-col v-if="isAuthorized" :span="24" :md="8" class="profile-column">
						<CardAvailabilitySettings />
					</a-col>

					<a-col v-if="isAuthorized" :span="24" :md="8" class="profile-column">
						<div class="card-wrapper">
							<CardConversations />
						</div>
						<div class="card-wrapper">
							<CardLocation />
						</div>
					</a-col>

					<!-- Full Calendar Card -->
					<a-col v-if="!isAuthorized" :span="36" :md="16" class="mb-24"
						style="display: flex; flex-direction: column;">
						<CardFullCalendar :googleCalendarConnectivity="googleConnectivity"></CardFullCalendar>
					</a-col>
				</a-row>

				<!-- Additional Cards -->
				<a-row v-if="user.role !== Role.Member">
					<CardUserAvailability />
				</a-row>

				<a-row type="flex" :gutter="24" align="stretch" style="margin-top: 20px;" v-if="isAuthorized">
					<a-col :span="24" :md="16">
						<CardFullCalendar :googleCalendarConnectivity="googleConnectivity" />
					</a-col>

					<a-col :span="24" :md="8" class="table-column">
						<CardUserTable />
					</a-col>
				</a-row>
			</template>
		</div>
	</a-spin>
</template>
<script>

import CardPlatformSettings from "../components/Cards/CardPlatformSettings"
import CardProfileInformation from "../components/Cards/CardProfileInformation"
import CardConversations from "../components/Cards/CardConversations"
import CardAvailabilitySettings from "../components/Cards/CardAvailabilitySettings.vue"
import CardUserTable from "../components/Cards/CardUserTable.vue"
import CardUserAvailability from "../components/Cards/CardUserAvailability.vue"
import CardLocation from "../components/Cards/CardLocation.vue"
import { userService } from "../services/user.service"
import { AuthenticationService } from "../services/auth.service"
import { Role } from "../helpers/roles"
import CardGoogleCalendar from "../components/Cards/CardGoogleCalendar.vue"
import CardFullCalendar from "../components/Cards/CardFullCalendar.vue"


export default ({
	components: {
		CardPlatformSettings,
		CardProfileInformation,
		CardConversations,
		CardAvailabilitySettings,
		CardUserTable,
		CardUserAvailability,
		CardGoogleCalendar, CardLocation,
		CardFullCalendar
	},

	data() {
		return {
			// Active button for the "User Profile" card's radio button group.
			user: null,
			Role: Role,
			defaultAvatar: 'images/face-1.jpg', // Default avatar image path
			googleConnectivity: false,
		}
	},
	watch: {
		'user.role': function (newRole, oldRole) {
			// You can add any logic here, for example:
			if (newRole === this.Role.Master) {
				console.log('User role is now Master!');
				// Additional logic when role is changed to 'Master'
			} else if (newRole === this.Role.Surfer) {
				console.log('User role is now Surfer!');
				// Additional logic for 'Surfer' role
			}
		}
	},
	mounted() {
		this.fetchUserData();
	},
	computed: {
		isAuthorized() {
			return this.user?.role === Role.Master || this.user?.role === Role.Member;
		},


	},
	methods: {
		onProfileUpdated() {
			this.$message.info("Profile has been updated!");
			this.fetchUserData(); // Example action
		},


		onGoogleConnectivity(value) {
			this.googleConnectivity = value
		},

		async fetchUserData() {
			try {
				// Fetch user data from the UserService
				const userData = await userService.getById(AuthenticationService.currentUserValue["userId"]);
				this.user = {
					name: `${userData.data.firstName} ${userData.data.lastName}`,
					position: userData.data.position,
					avatar: userData.data.avatar,
					role: userData.data.permissionLevel
				};
				console.log(userData.data === Role.Master)
			} catch (error) {
				console.error('Error fetching user data:', error);
			}
		},

		handleAvailabilityChange(status) {
			console.log("User availability changed to:", status);
			// Here, you can update the user's status in the app or make an API call if needed.
		},
		onPhotoChange(event) {
			const file = event.target.files[0];
			if (file) {
				this.uploadPhoto(file);
			}
		},
		async uploadPhoto(file) {
			try {
				// Prepare the body with any necessary user data
				const body = {
					// Add any user properties you want to update along with the photo
					// For example, if you're updating only the avatar, you may leave this empty
				};

				// Upload the new photo using UserService
				const user = await userService.putUser(
					AuthenticationService.currentUserValue["userId"],
					body,
					file // Pass the file as the third parameter
				);

				// Update the avatar with the new URL
				this.user.avatar = user.data.avatar;
			} catch (error) {
				console.error('Error uploading photo:', error);
			}
		}

	}
})

</script>
<style scoped>
.profile-nav-bg {
	/* Style for profile background */
}

.avatar-container {
	position: relative;
}

.avatar-overlay {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	background: rgba(0, 0, 0, 0.5);
	opacity: 0;
	transition: opacity 0.3s;
}

.avatar-container:hover .avatar-overlay {
	opacity: 1;
}

.upload-label {
	cursor: pointer;
}

.right-section {
	display: flex;
	justify-content: flex-end;
	align-items: center;
}

.quote-section {
	text-align: right;
}

.card-wrapper {
	flex: 0.5;
	margin-bottom: 16px;
}

.calendar-column {
	display: flex;
	flex-direction: column;
}

.profile-column {
	display: flex;
	flex-direction: column;
}

.table-column {
	display: flex;
	flex-direction: column;
}
</style>