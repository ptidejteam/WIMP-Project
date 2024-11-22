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


    <!-- Calendar View Controls -->
    <div style="margin: 16px; text-align: start;">
      <!-- View Selection Dropdown -->
      <a-select v-model="view" style="width: 200px;" placeholder="Select View">
        <a-select-option value="month">Month View</a-select-option>
        <a-select-option value="week">Week View</a-select-option>
        <a-select-option value="day">Day View</a-select-option>
      </a-select>

      <!-- Additional Controls -->
      <!-- <div style="margin-top: 16px;">
        <a-button type="primary" @click="refreshEvents" style="margin-right: 8px;">
          Refresh
        </a-button>
        <a-button type="default" @click="filterEvents">
          Filter Events
        </a-button>
      </div> -->
    </div>

    <!-- Calendar Component -->
    <div>
      <a-spin :spinning="spinning">

        <a-card>
          <template>
            <Calendar style="height: 800px" :view="view" :use-detail-popup="true" :week="week" :calendars="calendars"
              :events="events" />
          </template>
        </a-card>
      </a-spin>

    </div>


  </a-card>
</template>

<script>
import { AuthenticationService } from '../../services/auth.service';
import { userService } from '../../services/user.service';

import Calendar from '@toast-ui/vue-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
export default {
  props: {
    googleCalendarConnectivity: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    Calendar
  },
  data() {
    return {
      // for toast 
      view: "month",
      week: {
        taskView: 'disable'
      },
      calendars: [{ id: 'cal1', name: 'Personal' }],
      events: [],
      userId: AuthenticationService.currentUserValue.userId,
      googleAccessToken: null,
      tokenExpirationTime: null,
      lastUpdated: Date.now(),
      spinning: false,
    };
  },
  async mounted() {
  },
  watch: {
    googleCalendarConnectivity: function (n, o) {
      if (n) this.fetchEvents();
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
      this.spinning = true;
      const response = await userService.getById(this.userId);
      this.googleAccessToken = response?.data.googleAccessToken;
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
          this.spinning = false;
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
        this.spinning = false;

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
