<template>
	<a-card :bodyStyle="{ padding: '16px' }" :bordered="true">
		<!-- Title Section -->
		<template #title>
			<div class="profile-header">
				<h6 class="font-semibold">Profile Control Panel</h6>
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
				<div class="section" v-if="GCIntegrationAvailable"
					style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px;">
					<div style="display: flex; align-items: center;">
						<a-badge :dot="!isCalendarConnected" style="margin-right: 1rem;">
							<h6 class="font-semibold" style="margin: 0;">Google Calendar Integration</h6>
						</a-badge>

					</div>
					<a-button v-if="!isCalendarConnected" type="default" @click="connectGoogleCalendar"
						style="display: flex; align-items: center; padding: 0.5rem 1rem;">
						Connect to
						<img src="images/logos/Google__G__Logo.svg.png" alt="Google Logo"
							style="width: 1.2rem; margin-left: 0.5rem;">
					</a-button>
					<p v-if="isCalendarConnected"
						style="margin: 0; font-size: 0.9rem; color: #28a745; display: flex; align-items: center;">
						<a-icon type="check-circle" style="margin-right: 0.5rem;"></a-icon>
						<span style="margin-right: auto;">Synced</span>
						<a-button type="danger" icon="delete" shape="round" style="margin-left: 0.5rem;"></a-button>
					</p>

				</div>



				<!-- Connectivity Notifications -->
				<div class="section" >
					<div style="display: flex; justify-content: space-between;">
						<h6 class="font-semibold">Connectivity Notifications</h6>
						<a-switch v-model="notificationsEnabled" checked-children="On" un-checked-children="Off" />

					</div>

					<p class="text-muted">
						Turn this setting on to receive alerts for connectivity changes.
					</p>

				</div>

				<!-- Privacy Section -->
				<div class="section">
					<h6 class="font-semibold">Privacy</h6>
					<p class="text-muted">
						By using this platform, you consent to the collection and use of your data as described in
						our
						privacy
						policy. You can review your consent status below and clear your profile data if desired.
					</p>
					<p><b>Consent Status:</b> {{ this.profile.consentGiven ? "Given" : "Not Given" }}</p>
					<div class="privacy-button">
						<a-button type="default" @click="toggleConsent" shape="round">
							{{ this.profile.consentGiven ? "Revoke Consent" : "Give Consent" }}
						</a-button>
						<a-popconfirm
							title="Are you sure you want to clear your profile data? This action cannot be undone."
							placement="topLeft" ok-text="Yes, clear it" cancel-text="Cancel"
							@confirm="clearProfileData">
							<a-button type="danger" icon="delete" shape="round">
								Clear Profile Data
							</a-button>
						</a-popconfirm>


					</div>

				</div>
			</div>
		</template>
	</a-card>
</template>

<script>
import { AuthenticationService } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import { Role } from "../../helpers/roles";
import debounce from "lodash/debounce";

export default {
	data() {
		return {
			isEditing: false,
			timer: null,
			isTokenExpired: false, // Track token expiration state
			notificationsEnabled: true,
			userId: AuthenticationService.currentUserValue.userId,
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

	computed: {
		isCalendarConnected() {
			const tokenExpirationTime = this.profile?.googleAccessTokenExpiry;
			return (
				this.profile?.googleAccessToken &&
				tokenExpirationTime &&
				Date.now() < new Date(tokenExpirationTime).getTime() &&
				!this.isTokenExpired // Check if token is expired
			);
		},

		GCIntegrationAvailable() { 
			return this.profile?.permissionLevel > Role.Surfer;
		}
	},
	created() {
		this.loadUserProfile();
	},
	watch: {
		'profile.googleAccessToken': {
			handler: 'handleCalendarConnectionChange',
			immediate: true,
		},

		// Watch for changes in the token expiration
		'profile.googleAccessTokenExpiry': function (expiry) {
			// Ensure profile exists and expiry is a valid date
			if (this.profile && expiry) {
				if (this.timer) {
					clearInterval(this.timer); // Clear the existing timer
				}
				this.startTokenExpirationCheck(new Date(expiry).getTime()); // Start a new timer if expiration time changes
			} else {
				// If profile is null or expiry is not valid, stop the timer
				if (this.timer) {
					clearInterval(this.timer); // Stop the timer if profile is unavailable
				}
				console.log('No valid profile or expiration time, stopping token expiration check.');
			}
		}
	},
	beforeDestroy() {
		// Clean up the interval timer if any before destroying the component
		if (this.timer) {
			clearInterval(this.timer);
		}
	},
	methods: {
		// Method to start the timer to check expiration
		startTokenExpirationCheck(expiry) {
			// Check token expiration immediately on start
			this.checkTokenExpiration(expiry);

			// Set an interval to check the token expiration periodically
			const checkInterval = Math.max(expiry - Date.now() - 1000, 0); // Check just before expiration
			this.timer = setInterval(() => {
				this.checkTokenExpiration(expiry);
			}, checkInterval); // Schedule next check closer to expiration
		},

		// Method to check if the token is expired
		checkTokenExpiration(expiry) {
			if (expiry && Date.now() >= expiry) {
				console.log('Token has expired.');
				this.handleTokenExpiration();
			}
			this.isTokenExpired = false;
		},

		// Handle the token expiration (e.g., notify user or log out)
		handleTokenExpiration() {
			// Logic to handle token expiration (e.g., logging out user)
			console.log('Token expired!');
			this.isTokenExpired = true; // Set the token expired flag
			this.handleCalendarConnectionChange();
			clearInterval(this.timer);

		},

		// Load user profile and check the token expiration
		async loadUserProfile() {
			try {
				const userProfile = await userService.getById(this.userId);
				this.profile = { ...userProfile.data };

				// Start checking the token expiration if profile exists
				if (this.profile?.googleAccessTokenExpiry) {
					this.startTokenExpirationCheck(new Date(this.profile.googleAccessTokenExpiry).getTime());
				}
			} catch (error) {
				this.$message.error("Failed to load user profile.");
			}
		},

		// Method to handle calendar connection change
		handleCalendarConnectionChange() {
			this.$emit("google-connectivity", this.isCalendarConnected);
		},

		// Save user profile
		async saveProfile() {
			try {
				await userService.putUser(this.userId, this.profile);
				this.$message.success("Profile updated successfully.");
				this.$emit("profile-updated");
			} catch (error) {
				this.$message.error("Failed to save profile.");
			}
		},

		// Debounced save profile method
		debounceSave: debounce(function () {
			this.saveProfile();
		}, 300),

		// Toggle editing state and save profile when editing is done
		toggleEdit() {
			this.isEditing = !this.isEditing;
			if (!this.isEditing) this.debounceSave();
		},

		// Clear user profile data
		async clearProfileData() {
			// this.$confirm({
			// 	title: "Clear profile data?",
			// 	content: "This action cannot be undone.",
			// 	onOk: async () => {
			try {
				await userService.deleteUserPrivacy(this.userId);
				this.$message.success("Profile data cleared.");
				this.loadUserProfile();
			} catch (error) {
				console.log(error.message);
				this.$message.error("Profile: " + error.message);
			}
			// 	},
			// });
		},

		// Connect to Google Calendar
		connectGoogleCalendar() {
			const CLIENT_ID = process.env.VUE_APP_GOOGLE_CLIENT_ID || "656112522901-ec34iteeu8prg629oab9qbn831tbnd22.apps.googleusercontent.com";
			const REDIRECT_URI = process.env.VUE_APP_GOOGLE_REDIRECT_URIS || "http://localhost:8080/calendar";
			const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

			const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(SCOPE)}`;

			const popupWindow = window.open(
				authUrl,
				"GoogleCalendarAuth",
				"width=600,height=600,scrollbars=yes,resizable=yes"
			);

			const pollTimer = setInterval(() => {
				try {
					if (popupWindow.closed) {
						clearInterval(pollTimer);
						this.$message.info("Connection process completed or cancelled.");
						this.loadUserProfile();

					}
				} catch (e) {
					console.error("Error checking popup status:", e);
				}
			}, 1000);
		},

		// Toggle consent state
		toggleConsent() {
			this.profile.consentGiven = !this.profile.consentGiven;
			this.debounceSave();
		},

		// Format date for display
		formatDate(date) {
			return date ? new Date(date).toLocaleDateString() : "N/A";
		},

		// Get role label based on level
		GetPermissionLevel(level) {
			return this.availableRoles.find((role) => role.value === level)?.label || "Unknown";
		},

		// Get the tag color based on role level
		getTagColor(level) {
			return {
				[Role.Surfer]: "red",
				[Role.Member]: "orange",
				[Role.Master]: "green",
			}[level] || "gray";
		}
	}

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

.privacy-button {
	display: flex;
	justify-content: flex-end;
}

.anticon-notification {
	width: 16px;
	height: 16px;
	line-height: 16px;
	font-size: 16px;
}
</style>