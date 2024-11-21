<template>
	<!-- Meetings Card -->
	<a-card 
	  :bordered="true" 
	  :bodyStyle="{ padding: '16px' }"
	>
	  <!-- Card Title -->
	  <template #title>
		<h6 class="font-semibold m-0">📅 Meeting Requests</h6>
	  </template>
  
	  <!-- Card Content -->
	  <div class="meetings-list-container" style="overflow-y: auto;">
		<!-- Loader -->
		<a-spin v-if="isLoading" class="loading-spinner" />
  
		<!-- Meetings List -->
		<a-list
		  class="meetings-list"
		  item-layout="horizontal"
		  :split="false"
		  v-if="!isLoading && meetings.length"
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
				alt="Avatar"
			  />
			</a-list-item-meta>
  
			<!-- Meeting Status -->
			<div>
			  <span 
				v-if="item.status === 'pending'" 
				class="status pending"
			  >
				Pending
			  </span>
			  <span 
				v-if="item.status === 'accepted'" 
				class="status accepted"
			  >
				Accepted
			  </span>
			  <span 
				v-if="item.status === 'declined'" 
				class="status declined"
			  >
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
		  <!-- <img 
			src="empty-meetings.svg" 
			alt="No Meetings" 
			class="empty-image"
		  /> -->
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
		meetings: [],
		isLoading: false,
		error: false,
		pollingInterval: null,
	  };
	},
	mounted() {
	  this.fetchMeetings();
	  //this.startPolling();
	},
	beforeDestroy() {
	  this.stopPolling();
	},
	methods: {
	  async fetchMeetings() {
		this.isLoading = true;
		this.error = false;
  
		try {
		  const response = await meetingService.listMeetingsRequested(
			AuthenticationService.currentUserValue["userId"]
		  );
		  const meetings = response.data;
  
		  // Fetch user information for each meeting
		  const userPromises = meetings.map((meeting) =>
			userService.getById(meeting.requesterId)
		  );
		  const users = await Promise.all(userPromises);
  
		  // Combine meetings with user data
		  this.meetings = meetings.map((meeting, index) => ({
			...meeting,
			user: users[index].data,
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
	},
  };
  </script>
  
  <style scoped>
  .meetings-list-container {
	border: 1px solid #e8e8e8;
	border-radius: 4px;
	padding: 16px;
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
  
  .empty-image {
	max-width: 150px;
	margin-bottom: 16px;
  }
  
  .error-message {
	text-align: center;
	color: red;
  }
  </style>
  