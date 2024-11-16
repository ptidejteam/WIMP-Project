<!-- 
	This is the user profile page, it uses the dashboard layout in: 
	"./layouts/Dashboard.vue" .
 -->
<template>
	<div :key="user.role">
		<!-- Header Background Image -->
		<div class="profile-nav-bg"></div>

		<!-- User Profile Card -->
		<a-card :bordered="false" class="card-profile-head" :bodyStyle="{ padding: 0 }">
			<template #title>
				<a-row type="flex" align="middle">
					<a-col :span="24" :md="12" class="col-info">
						<!-- Avatar Container with Overlay -->
						<div class="avatar-container">
							<a-avatar :size="120" shape="square" :src="user.avatar || defaultAvatar" />
							<!-- Overlay to change picture -->
							<div class="avatar-overlay">
								<label class="upload-label">
									<input type="file" @change="onPhotoChange" accept="image/*" class="upload-input" />
									<span class="upload-text">Change Photo</span>
								</label>
							</div>
						</div>

						<div class="avatar-info">
							<h4 class="font-semibold m-0">Welcome {{ user.name }} !</h4>
							<p>{{ user.position }}</p>
						</div>
					</a-col>
					<a-col :span="24" :md="12"
						style="display: flex; align-items: center; justify-content: flex-end"></a-col>
				</a-row>
			</template>
		</a-card>
		<!-- User Profile Card -->

		<a-row type="flex" :gutter="24">

			<!-- Profile Information Column Visible for Both Roles -->
			<a-col :span="24" :md="8" class="mb-24">
				<!-- Profile Information Card -->
				<CardProfileInformation></CardProfileInformation>
				<!-- / Profile Information Card -->
			</a-col>
			<!-- Conditional Rendering Based on User Role -->
			<a-col v-if="user.role === Role.Master" :span="24" :md="8" class="mb-24">
				<!-- Platform Settings Card -->
				<CardPlatformSettings></CardPlatformSettings>
				<!-- / Platform Settings Card -->
			</a-col>

			<a-col v-if="user.role === Role.Master || user.role === Role.Member" :span="24" :md="8" class="mb-24">
				<!-- Availability Card -->
				<CardAvailabilitySettings></CardAvailabilitySettings>
				<!-- / Availability Card -->
			</a-col>



			<!-- Conditional Rendering for Members -->
			<a-col v-if="user.role === Role.Master || user.role === Role.Member" :span="24" :md="8" class="mb-24">
				<!-- Conversations Card -->
				<CardConversations :data="conversationsData"></CardConversations>
				<!-- / Conversations Card -->
			</a-col>
			<a-col v-if="user.role === Role.Master || user.role === Role.Member" :span="24" :md="8" class="mb-24">
				<!-- Conversations Card -->
				<CardGoogleCalendar @availability-change="handleAvailabilityChange"></CardGoogleCalendar>
				<!-- / Conversations Card -->
			</a-col>


		</a-row>

		<!-- Table & Timeline -->
		<a-row :gutter="24" type="flex" align="stretch">
			<!-- Table -->
			<a-col v-if="user.role === Role.Master || user.role === Role.Member" :span="24" :lg="16" class="mb-24">

				<!-- Projects Table Card -->
				<CardUserTable></CardUserTable>
				<!-- / Projects Table Card -->

			</a-col>
			<!-- / Table -->

			<!-- Timeline -->
			<a-col :span="24" :lg="8" class="mb-24">

				<!-- Orders History Timeline Card -->
				<!-- / Orders History Timeline Card -->
				<CardLocation></CardLocation>

			</a-col>
			<!-- / Timeline -->
		</a-row>
		<!-- / Table & Timeline -->
		<a-row v-if="user.role !== Role.Member">
			<CardUserAvailability></CardUserAvailability>

		</a-row>
		<a-row v-if="user.role === Role.Master">
			<!-- Device Column -->
			<CardDevice></CardDevice>
		</a-row>



		<!-- / Projects Card -->
	</div>
</template>

<script>

import CardPlatformSettings from "../components/Cards/CardPlatformSettings"
import CardProfileInformation from "../components/Cards/CardProfileInformation"
import CardConversations from "../components/Cards/CardConversations"
import CardProject from "../components/Cards/CardProject"
import CardAvailabilitySettings from "../components/Cards/CardAvailabilitySettings.vue"
import CardUserTable from "../components/Cards/CardUserTable.vue"
import CardDevice from "../components/Cards/CardDevice.vue"
import CardUserAvailability from "../components/Cards/CardUserAvailability.vue"
import CardLocation from "../components/Cards/CardLocation.vue"
import { userService } from "../services/user.service"
import { AuthenticationService } from "../services/auth.service"
import { Role } from "../helpers/roles"
import CardGoogleCalendar from "../components/Cards/CardGoogleCalendar.vue"
// Conversation's list data.
const conversationsData = [
	{
		id: "1",
		title: "Sophie B.",
		code: "Hi! I need more information…",
		avatar: "images/face-3.jpg",
	},
	{
		id: "2",
		title: "Anne Marie",
		code: "Awesome work, can you…",
		avatar: "images/face-4.jpg",
	},
	{
		id: "3",
		title: "Ivan",
		code: "About files I can…",
		avatar: "images/face-5.jpeg",
	},
	{
		id: "4",
		title: "Peterson",
		code: "Have a great afternoon…",
		avatar: "images/face-6.jpeg",
	},
	{
		id: "5",
		title: "Nick Daniel",
		code: "Hi! I need more information…",
		avatar: "images/face-2.jpg",
	},
];

// Project cards data
const projects = [
	{
		id: 1,
		title: "Modern",
		content: "As Uber works through a huge amount of internal management turmoil.",
		cover: "images/home-decor-3.jpeg",
		team: [
			"images/face-1.jpg",
			"images/face-4.jpg",
			"images/face-2.jpg",
			"images/face-3.jpg",
		],
	},
	{
		id: 2,
		title: "Scandinavian",
		content: "Music is something that every person has his or her own specific opinion about.",
		cover: "images/home-decor-2.jpeg",
		team: [
			"images/face-1.jpg",
			"images/face-4.jpg",
			"images/face-2.jpg",
			"images/face-3.jpg",
		],
	},
	{
		id: 3,
		title: "Minimalist",
		content: "Different people have different taste, and various types of music, Zimbali Resort.",
		cover: "images/home-decor-1.jpeg",
		team: [
			"images/face-1.jpg",
			"images/face-4.jpg",
			"images/face-2.jpg",
			"images/face-3.jpg",
		],
	},
];

export default ({
	components: {
		CardPlatformSettings,
		CardProfileInformation,
		CardConversations,
		CardProject,
		CardAvailabilitySettings,
		CardUserTable,
		CardUserAvailability,
		CardDevice,
		CardGoogleCalendar,CardLocation
	},

	data() {
		return {
			// Active button for the "User Profile" card's radio button group.
			profileHeaderBtns: 'overview',

			// Associating Conversation's list data with its corresponding property.
			conversationsData,

			// Project cards data
			projects,

			user: {
				name: 'John Doe',
				position: 'Software Engineer',
				avatar: null, // Avatar is null for this example
				role: Role.Surfer,
			},
			Role: Role,
			defaultAvatar: 'images/face-1.jpg', // Default avatar image path
			availabilityStatus: '',
		}
	},
	watch: {
		'user.role': function (newRole, oldRole) {
			// This function will be called whenever user.role changes
			console.log(`Role changed from ${oldRole} to ${newRole}`);
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
	created() {
		this.fetchUserData();
	},
	methods: {
		async fetchUserData() {
			try {
				// Fetch user data from the UserService

				const userData = await userService.getById(AuthenticationService.currentUserValue["userId"]);
				this.user.name = `${userData.data.firstName} ${userData.data.lastName}`;
				this.user.position = userData.data.position;
				this.user.avatar = userData.data.avatar;
				this.user.role = userData.data.permissionLevel; // Assuming 'role' is part of the fetched data

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

<style lang="scss">
/* Avatar container with relative positioning */
.avatar-container {
	position: relative;
	display: inline-block;
}

/* Overlay positioned on top of avatar */
.avatar-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	color: white;
	display: flex;
	justify-content: center;
	align-items: center;
	opacity: 0;
	transition: opacity 0.3s ease;
	border-radius: 4px;
	/* Match the avatar's shape */
}

/* Show the overlay when hovering over the container */
.avatar-container:hover .avatar-overlay {
	opacity: 1;
	cursor: pointer;
}

/* Hide the file input but keep it accessible */
.upload-input {
	display: none;
}

/* Styling for the "Change Photo" text */
.upload-text {
	font-size: 14px;
	text-transform: uppercase;
}

/* Label for clickable text */
.upload-label {
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
}
</style>