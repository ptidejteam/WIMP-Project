<template>
	<!-- Meetings Card -->
	<a-card :bordered="true" :bodyStyle="{ padding: '16px' }">
		<!-- Card Title -->
		<template #title>
			<div class="header">
				<div style="display: flex; flex-direction: column;">
					<h6 class="font-semibold m-0">📅 Meeting Requests</h6>
					<small style="font-style: italic;">Updated: {{ lastUpdated | date }}</small>

				</div>
				<a-button icon="redo" type="link" @click="fetchMeetings">Refresh</a-button>
			</div>


		</template>

		<!-- Card Content -->
		<div class="meetings-list-container">
			<!-- Loader -->
			<a-spin v-if="isLoading" />

			<!-- Meetings List -->
			<a-list class="meetings-list" item-layout="horizontal" :split="false" v-if="!isLoading && meetings.length"
				:data-source="meetings">
				<a-list-item slot="renderItem" slot-scope="item">
					<a-list-item-meta :title="item.user.firstName + ' ' + item.user.lastName"
						:description="formatMeetingTime(item.time)">
						<a-avatar slot="avatar" :size="48" shape="square" :src="item.user.avatar" alt="Avatar" />
					</a-list-item-meta>

					<!-- Meeting Status -->
					<div>
						<span v-if="item.status === 'pending'" class="status pending">
							Pending
						</span>
						<span v-if="item.status === 'accepted'" class="status accepted">
							Accepted
						</span>
						<span v-if="item.status === 'declined'" class="status declined">
							Declined
						</span>
					</div>

					<!-- Actions -->
					<template #actions>
						<span v-if="item.status === 'pending'">
							<a-button type="primary" @click="acceptRequest(item._id)">Accept</a-button>
							<a-button type="danger" @click="declineRequest(item._id)">Decline</a-button>
						</span>
						<span v-else>
							<a-button type="default" disabled>{{ item.status | capitalize }}</a-button>
						</span>
					</template>
				</a-list-item>
			</a-list>

			<!-- Empty State -->
			<div v-else-if="!isLoading" class="empty-state">
				<h6>No meeting requests available.</h6>
				<p>Check back later for new requests.</p>
			</div>

			<!-- Error Message -->
			<div v-if="error" class="error-message">
				<p>⚠️ Failed to load meeting requests. Please try again later.</p>
			</div>
		</div>
	</a-card>
</template>

<script>
import { meetingService } from "../../services/meeting.service";
import { userService } from "../../services/user.service";
import { AuthenticationService } from "../../services/auth.service";

export default {
	data() {
		return {
			userId: AuthenticationService.currentUserValue.userId,
			meetings: [],
			lastUpdated: null,
			userCache: {},
			isLoading: false,
			error: false,
			pollingInterval: null,
		};
	},
	mounted() {
		this.fetchMeetings();
		// Uncomment the line below to enable polling if needed
		// this.startPolling();
	},
	beforeDestroy() {
		this.stopPolling();
	},
	methods: {

		async fetchMeetings() {
			this.isLoading = true;
			this.error = false;

			try {
				const response = await meetingService.listMeetingsRequested(this.userId);
				const meetings = response.data;

				const users = await Promise.all(
					meetings.map(async (meeting) => {
						if (!this.userCache[meeting.requesterId]) {
							this.userCache[meeting.requesterId] = await userService.getById(meeting.requesterId);
						}
						return this.userCache[meeting.requesterId];
					})
				);

				// Combine meetings with user data
				this.meetings = meetings.map((meeting, index) => ({
					...meeting,
					user: users[index]?.data || null,
				}));
			} catch (error) {
				console.error(error);
				this.error = true;
			} finally {
				this.isLoading = false;
			}
		},


		startPolling() {
			this.pollingInterval = setInterval(this.fetchMeetings, 5000); // Poll every 5 seconds
		},
		stopPolling() {
			if (this.pollingInterval) {
				clearInterval(this.pollingInterval);
			}
		},
		async acceptRequest(id) {
			try {
				await meetingService.updateMeeting({ meetingId: id, status: "accepted" });
				this.fetchMeetings();
				this.$message.success(`Accepted meeting request with ID: ${id}`);
			} catch (error) {
				this.$message.error("Failed to accept meeting request.");
			}
		},
		async declineRequest(id) {
			try {
				await meetingService.updateMeeting({ meetingId: id, status: "declined" });
				this.fetchMeetings();
				this.$message.success(`Declined meeting request with ID: ${id}`);
			} catch (error) {
				this.$message.error("Failed to decline meeting request.");
			}
		},
		formatMeetingTime(time) {
			return new Date(time).toLocaleString();
		},
	},
	filters: {
		capitalize(value) {
			if (!value) return "";
			return value.charAt(0).toUpperCase() + value.slice(1);
		},
		date(value) {

			return !value ? "" : new Date(value).toLocaleString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		},
	},
};
</script>

<style scoped>
.meetings-list-container {
	border: 1px solid #e8e8e8;
	border-radius: 4px;
	padding: 16px;
	max-height: 250px;
	/* Adjust height as needed */
	overflow-y: auto;
	/* Makes the container scrollable */
}

.loading-spinner {
	text-align: center;
	padding: 20px;
}

.status {
	font-weight: bold;
	text-transform: capitalize;
}

.status.pending {
	color: orange;
}

.status.accepted {
	color: green;
}

.status.declined {
	color: red;
}

.empty-state {
	text-align: center;
	padding: 20px;
}

.error-message {
	text-align: center;
	color: red;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>