<template>
	<!-- Meetings Card -->
	<a-card :bordered="false" class="header-solid h-full" :bodyStyle="{ paddingTop: 0, paddingBottom: '16px' }">
		<template #title>
			<h6 class="font-semibold m-0">Meeting Requests</h6>
		</template>
		<div class="meetings-list-container" style="overflow-y: auto;">
			<a-list
				class="meetings-list"
				item-layout="horizontal"
				:split="false"
				v-if="meetings.length"
				:data-source="meetings"
			>
				<a-list-item slot="renderItem" slot-scope="item">
					<a-list-item-meta
						:title="item.user.firstName + ' ' + item.user.lastName"
						:description="formatMeetingTime(item.time)"
					>
						<a-avatar
							slot="avatar"
							:size="48"
							shape="square"
							:src="item.user.avatar"
						/>
					</a-list-item-meta>

					<!-- Display meeting status -->
					<div>
						<span v-if="item.status === 'pending'" style="color: orange;">Pending</span>
						<span v-if="item.status === 'accepted'" style="color: green;">Accepted</span>
						<span v-if="item.status === 'declined'" style="color: red;">Declined</span>
					</div>

					<template #actions>
						<!-- Actions are shown based on status -->
						<span v-if="item.status === 'pending'">
							<a-button type="default" @click="acceptRequest(item._id)">ACCEPT</a-button>
							<a-button type="danger" @click="declineRequest(item._id)">DECLINE</a-button>
						</span>
						<span v-else-if="item.status === 'accepted'">
							<a-button type="default" disabled>Accepted</a-button>
						</span>
						<span v-else-if="item.status === 'declined'">
							<a-button type="default" disabled>Declined</a-button>
						</span>
					</template>
				</a-list-item>
			</a-list>
			<div v-else style="text-align: center; margin-top: 20px;">
				<h6>No meeting requests available.</h6>
			</div>
		</div>
	</a-card>
	<!-- / Meetings Card -->
</template>

<script>
import { meetingService } from "../../services/meeting.service"; // Adjust the path as necessary
import { userService } from "../../services/user.service";
import { AuthenticationService } from "../../services/auth.service";
export default {
	data() {
		return {
			meetings: [],
			pollingInterval: null,
		};
	},
	mounted() {
		this.fetchMeetings(); // Fetch meetings initially
		this.startPolling();   // Start polling for new meetings
	},
	beforeDestroy() {
		this.stopPolling();    // Stop polling when component is destroyed
	},
	methods: {
		async fetchMeetings() {
			try {
				const response = await meetingService.listMeetingsRequested(AuthenticationService.currentUserValue["userId"]);
				const meetings = response.data; // Assuming response.data contains the meetings
								// Fetch user information for each device
					
				const userPromises = meetings.map(meeting => userService.getById(meeting.requesterId)); // Adjust as per your API
                const users = await Promise.all(userPromises);

                // Combine devices with user information
                this.meetings = meetings.map((meeting, index) => ({
                    ...meeting,
                    user: users[index].data // Assuming each user response has a data field
                }));
			} catch (error) {
				this.$message.error("Failed to fetch meetings." );
				console.log(error);
				this.stopPolling();
			}
		},
		startPolling() {
			this.pollingInterval = setInterval(this.fetchMeetings, 1000); // Poll every 5 seconds
		},
		stopPolling() {
			if (this.pollingInterval) {
				clearInterval(this.pollingInterval);
			}
		},
		async acceptRequest(id) {
			try {
				const meetingData = { meetingId:id, status: 'accepted' }; // Adjust based on your API requirements
				await meetingService.updateMeeting(meetingData);
				this.fetchMeetings(); // Refresh meetings after accepting
				this.$message.success(`Accepted meeting request with ID: ${id}`);
			} catch (error) {
				this.$message.error("Failed to accept meeting request.");
			}
		},
		async declineRequest(id) {
			try {
				const meetingData = { id, status: 'declined' }; // Adjust based on your API requirements
				await meetingService.updateMeeting(meetingData);
				this.fetchMeetings(); // Refresh meetings after declining
				this.$message.success(`Declined meeting request with ID: ${id}`);
			} catch (error) {
				this.$message.error("Failed to decline meeting request.");
			}
		},
		formatMeetingTime(time) {
			const date = new Date(time);
			return date.toLocaleString(); // Adjust the format as necessary
		},
	},
};
</script>

<style scoped>
.meetings-list-container {
	border: 1px solid #e8e8e8; /* Optional: for better visibility */
	border-radius: 4px;
	padding: 8px; /* Optional: to add some padding */
}
</style>
