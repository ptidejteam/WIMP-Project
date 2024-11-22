<template>
  <!-- Calendar Events Card Template -->
  <a-card :bordered="true" :bodyStyle="{ padding: '16px' }">

    <!-- Title -->
    <template #title>
      <div class="header">
        <h6 class="font-semibold m-0">Calendar</h6>
        <div>
          <a-button icon="redo" type="link" @click="fetchEvents">Refresh</a-button>
          <small style="font-style: italic;">Updated: {{ lastUpdated || "Fetching data..." }}</small>
        </div>
      </div>
    </template>

    <!-- <div class="section">
      <div style="display: flex; justify-content: space-between;">
        <h6 class="font-semibold">Stay organized by connecting your Google Calendar !</h6>
        <div v-if="events.length === 0">
          <a-button type="default" @click="connectGoogleCalendar" style="display: flex; align-items: center;">
            Connect to
            <img src="images/logos/Google__G__Logo.svg.png" alt="Google Logo" style="width: 1.2rem; margin-left: 0.5rem;">
          </a-button>
        </div>
      </div>

      <template v-if="events.length === 0">
        <p class="text-muted">Once connected, your upcoming events will be displayed here for easy access and management.</p>
      </template>

      <p v-else class="text-muted" style="margin-top: 0; margin-bottom: 0em;">
        Your calendar is now synced! View and manage your upcoming events below to stay on top of your schedule effortlessly.
      </p>
    </div> -->

    <!-- Calendar View Controls -->
    <div style="margin: 16px; text-align: start;">
  <a-radio-group v-model="view" button-style="solid">
    <a-radio value="month">Month View</a-radio>
    <a-radio value="week" style="margin-left: 8px;">Week View</a-radio>
    <a-radio value="day" style="margin-left: 8px;">Day View</a-radio>
  </a-radio-group>
</div>

    <!-- Calendar Component -->
    <div>
      <a-card>
        <template>
          <Calendar style="height: 800px" :view="view" :use-detail-popup="false" :week="week" :calendars="calendars"
            :events="events"/>
        </template>
      </a-card>
    </div>

  </a-card>
</template>

<script>
import { AuthenticationService } from '../../services/auth.service';
import { userService } from '../../services/user.service';

import Calendar from '@toast-ui/vue-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
export default {
  components: {
    Calendar
  },
  data() {
    return {
      // for toast 
      view:"month",
      week:{
        taskView : 'disable'
      },
      calendars: [{ id: 'cal1', name: 'Personal' }],
      events: [],
      userId: AuthenticationService.currentUserValue.userId,
      googleAccessToken: null,
      tokenExpirationTime: null,
      lastUpdated: Date.now(),
    };
  },
  async mounted() {
    // Get the token from the backend 
    const response = await userService.getById(this.userId);
    this.googleAccessToken = response?.data.googleAccessToken;
    this.tokenExpirationTime = response?.data.googleAccessTokenExpiry;
    if (this.googleAccessToken && this.tokenExpirationTime && Date.now() < new Date(this.tokenExpirationTime).getTime()) {
      this.fetchEvents();
    } else {
      this.$message.warning("Your session has expired. Please reconnect to Google Calendar.");
      this.connectGoogleCalendar();
    }
  },
  methods: {
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
            this.fetchEvents();
          }
        } catch (e) {
          console.error("Error checking popup status:", e);
        }
      }, 1000);
    },

    async fetchEvents() {
      try {
        const response = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${this.googleAccessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.events = data.items.map((event) => ({
          title: event.summary,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          display: 'background'
        }));

        console.log(this.events);
      } catch (error) {
        console.error("Error fetching Google Calendar events:", error);
        this.$message.error("Failed to load events. Please try reconnecting.");
      }
    },

    handleDateClick(info) {
      alert("Clicked on: " + info.dateStr);
    },
  },
};
</script>

<style>
.section {
  padding: 16px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

button {
  margin-left: 8px;
}
</style>
