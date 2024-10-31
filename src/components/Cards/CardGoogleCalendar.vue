<template>
	<a-card :bordered="false" class="header-solid h-full" :bodyStyle="{ paddingTop: 0, paddingBottom: '16px' }">
		<template #title>
			<h6 class="font-semibold m-0">Google Calendar Events</h6>
		</template>

		<!-- Connect Button -->
		<div v-if="events.length === 0" class="connect-button-container">
			<a-button type="default" @click="connectGoogleCalendar" style="background-color: ghostwhite">
				<img src="images/logos/Google__G__Logo.svg.png" alt="" style="width: 1rem; margin-right: 2%;">
				Connect to Google Calendar
			</a-button>
		</div>

		<!-- Events List Container with Scroll -->
		<div class="events-list-container">
			<a-list item-layout="horizontal" :split="false">
				<!-- Message if no events are available -->
				<a-list-item v-if="events.length === 0" class="no-events-message">
					<a-list-item-meta title="No upcoming events"
						:description="`Connect to Google Calendar to see your events.`" />
				</a-list-item>

				<!-- Display each event -->
				<a-list-item v-for="event in events" :key="event.id" class="event-item"
					:class="{ 'today-event': isToday(event.start) }">
					<a-list-item-meta :title="event.summary"
						:description="`Start: ${formatDate(event.start)} - End: ${formatDate(event.end)} | ${remainingTime(event.start)}`" />
					<a-button type="link">
						View
					</a-button>
				</a-list-item>
			</a-list>
		</div>
	</a-card>
</template>

<script>
import { userService } from '../../services/user.service';
import { AuthenticationService } from '../../services/auth.service';

export default {
	data() {
		return {
			events: [],
			googleAccessToken: null,
			tokenExpirationTime: null,
			notificationTimer: null,
			eventRefreshInterval: null,
		};
	},
	async mounted() {
		// Get the token from the backend 
		const response = await userService.getById(AuthenticationService.currentUserValue["userId"]);
		this.googleAccessToken = response?.data.googleAccessToken;
		this.tokenExpirationTime = response?.data.googleAccessTokenExpiry;
		if (this.googleAccessToken && this.tokenExpirationTime && Date.now() < new Date(this.tokenExpirationTime).getTime()) {
			this.startEventPolling();
		} else {
			this.$message.warning("Your session has expired. Please reconnect to Google Calendar.");
			this.connectGoogleCalendar();
		}
		this.startNotificationCheck();
	},
	beforeDestroy() {
		clearInterval(this.notificationTimer);
		clearInterval(this.eventRefreshInterval);
	},
	methods: {
		connectGoogleCalendar() {
			const CLIENT_ID = process.env.VUE_APP_GOOGLE_CLIENT_ID || "656112522901-ec34iteeu8prg629oab9qbn831tbnd22.apps.googleusercontent.com";
			const REDIRECT_URI = process.env.VUE_APP_GOOGLE_REDIRECT_URIS || "http://localhost:8080/calendar";
			const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

			const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(SCOPE)}`;
			const authWindow = window.open(authUrl, '_blank', 'width=600,height=600');

			// Listen for the window close event to start polling
			const pollAuthWindow = setInterval(() => {
				if (authWindow.closed) {
					clearInterval(pollAuthWindow); // Clear interval when the window is closed
					this.startEventPolling();
				}
			}, 5000);
		},
		async fetchCalendarEvents() {
			try {
				const response = await userService.getById(AuthenticationService.currentUserValue["userId"]);
				this.events = response?.data.googleCalendarEvents || [];
			} catch (error) {
				this.$message.error("Failed to fetch calendar events: " + error.message);
			}
		},
		formatDate(dateString) {
			const options = {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			};
			return new Date(dateString).toLocaleString(undefined, options);
		},
		remainingTime(dateTime) {
			const eventDate = new Date(dateTime);
			const now = new Date();
			const diffMs = eventDate - now;

			if (diffMs <= 0) return "Started";

			const hours = Math.floor(diffMs / (1000 * 60 * 60));
			const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

			return hours > 0
				? `${hours}h ${minutes}m remaining`
				: `${minutes}m remaining`;
		},
		isToday(dateTime) {
			const eventDate = new Date(dateTime);
			const today = new Date();
			return (
				eventDate.getDate() === today.getDate() &&
				eventDate.getMonth() === today.getMonth() &&
				eventDate.getFullYear() === today.getFullYear()
			);
		},
		startEventPolling() {
			this.fetchCalendarEvents(); // Initial fetch
			this.eventRefreshInterval = setInterval(() => {
				this.fetchCalendarEvents();
			}, 300000); // Poll every 5 minutes
		},
		startNotificationCheck() {
			this.notificationTimer = setInterval(this.checkUpcomingEvents, 60000); // Check every minute
		},
		checkUpcomingEvents() {
			const now = new Date();
			this.events.forEach(async (event) => {
				const eventStart = new Date(event.start);
				const timeDifference = eventStart - now;

				// Notify 15 minutes before the event
				if (timeDifference > 5 * 60 * 1000 && timeDifference <= 15 * 60 * 1000) {
					this.notifyUpcomingEvent(event, "in 15 minutes");
				}
				// Notify 5 minutes before the event
				else if (timeDifference > 0 && timeDifference <= 5 * 60 * 1000) {
					this.notifyUpcomingEvent(event, "in 5 minutes");
				}
				// Notify at the start of the event (within a 1-minute margin)
				else if (timeDifference >= -60 * 1000 && timeDifference <= 60 * 1000) {
					this.notifyUpcomingEvent(event, "now");
					this.$emit("availability-change", "do-not-disturb"); // Emit the availability change event
				}
			});
		},
		notifyUpcomingEvent(event, timeNotice) {
			const eventStart = new Date(event.start);
			const eventStartFormatted = eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Formats time as HH:MM

			this.$notification.open({
				message: 'Upcoming Event',
				description: `Your event "${event.summary}" starts ${timeNotice} at ${eventStartFormatted}.`,
				duration: 5,
			});
		},
	},
};
</script>

<style scoped>
.events-list-container {
	height: 300px;
	overflow-y: auto;
	border: 1px solid #e8e8e8;
	border-radius: 4px;
	padding: 8px;
	margin-top: 16px;
}

.event-item {
	padding: 12px;
	border-bottom: 1px solid #f0f0f0;
}

.today-event {
	background-color: #e6f7ff;
	border-left: 4px solid #1890ff;
}

.connect-button-container {
	text-align: center;
	margin: 16px 0;
}
</style>