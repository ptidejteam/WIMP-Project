<template>
	<!-- Meetings Card -->
	<a-card :bordered="true" :bodyStyle="{ padding: '16px' }">
		<!-- Card Title -->
		<template #title>
			<div class="header">
				<div style="display: flex; flex-direction: column;">
					<h6 class="font-semibold m-0">Meeting Requests</h6>
					<small style="font-style: italic;">Updated: {{ lastUpdated | date }}</small>
				</div>
				<a-button icon="redo" type="link" @click="fetchMeetings">Refresh</a-button>
			</div>
		</template>
		<template v-if="isLoading">
			<a-skeleton />
		</template>
		<template v-else>
			<template v-if="!meetings.length">
				<div class="no-meeting-container">
					<p class="no-meeting-text">
						No meetings requested yet! Start by adding a meeting to keep your agenda organized and track
						progress.
					</p>

				</div>
			</template>
			<a-tabs v-if="!isLoading && meetings.length">
				<a-tab-pane key="incoming-requester">
					<template #tab>
						Ongoing
						<a-badge :count="meetingAsRequester.length" v-if="meetingAsRequester.length > 0" />
					</template>
					<WidgetMeetingList :meetings="meetingAsRequester" :showActions="false"
						emptyMessage="No incoming requests as requester." @accept="acceptRequest"
						@decline="declineRequest" />
				</a-tab-pane>

				<a-tab-pane key="incoming-requested">
					<template #tab>
						Incoming
						<a-badge :count="meetingAsRequested.length" v-if="meetingAsRequested.length > 0" />
					</template>
					<WidgetMeetingList :meetings="meetingAsRequested" :isLoading="isLoading" :showActions="true"
						emptyMessage="No incoming requests as requested." @accept="acceptRequest"
						@decline="declineRequest" />
				</a-tab-pane>
			</a-tabs>

		</template>


	</a-card>
</template>

<script>
import { meetingService } from "../../services/meeting.service";
import { userService } from "../../services/user.service";
import { AuthenticationService } from "../../services/auth.service";
import WidgetMeetingList from "../Widgets/WidgetMeetingList.vue";

export default {
	components: {
		WidgetMeetingList
	},
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
		this.$subscribeToEvent(this.handleRefresh);

	},
	computed: {
		filteredMeeting() {
			return this.meetings?.filter(o => o.source === "internal");
		},
		meetingAsRequester() {
			console.log(this.filteredMeeting);
			return this.filteredMeeting.filter(meeting => meeting.requesterId === this.userId);
		},
		meetingAsRequested() {
			return this.filteredMeeting.filter(meeting => meeting.requestedUserId === this.userId);
		},

	},
	methods: {

		handleRefresh(e) {
			console.log(e);
			if (e.data === 'meeting-request') { this.fetchMeetings(); }
		},

		async fetchMeetings() {
			this.isLoading = true;
			this.error = false;

			try {
				const response = await meetingService.listMeetingsRequested(this.userId);
				const meetings = response.data;
				console.log(meetings);
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
				console.log(this.meetings);
				this.lastUpdated = Date.now();
			} catch (error) {
				console.error(error);
				this.error = true;
			} finally {
				this.isLoading = false;
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
		formatMeetingTime(item) {
			return new Date(item.start).toLocaleString();
		},
	},
	filters: {
		capitalize(value) {
			if (!value) return "";
			return value.charAt(0).toUpperCase() + value.slice(1);
		},
		date(value) {
			return !value
				? ""
				: new Date(value).toLocaleString("en-US", {
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
	padding: 16px;
	height: 250px;
	overflow-y: auto;
}

.loading-spinner {
	text-align: center;
	padding: 20px;
}

.status {
	font-weight: bold;
	text-transform: capitalize;
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.no-meeting-text {
	width: 80%;
	text-align: center;
}

.no-meeting-container {
	padding: 20px;
	background-color: #f9f9f9;
	border: 1px dashed #d9d9d9;
	border-radius: 8px;
	height: 200px;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>