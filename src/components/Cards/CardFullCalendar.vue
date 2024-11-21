<template>
  <!-- Calendar Events Card Template -->
  <a-card :bordered="false" class="header-solid h-full" :bodyStyle="{ paddingTop: 0, paddingBottom: '16px' }">

    <!-- Title -->
    <template #title>
      <h6 class="font-semibold m-0">Your Calendar</h6>
    </template>

    <!-- User-Friendly Description -->
    <div class="description-container">
      <template v-if="events.length === 0">
        <h6>Stay organized by connecting your Google Calendar !</h6>
        <p>Once connected, your upcoming events will be displayed here
          for
          easy access and management.</p>
      </template>
      <p v-else>
        Your calendar is now synced! View and manage your upcoming events below to stay on top of your schedule
        effortlessly.
      </p>
      <!-- Connect Button -->
      <div v-if="events.length === 0">
        <a-button type="default" @click="connectGoogleCalendar" style="    display: flex; align-items: center;">

          Connect to
          <img src="images/logos/Google__G__Logo.svg.png" alt="Google Logo"
            style="width: 1.2rem; margin-left: 0.5rem;">
        </a-button>
      </div>
    </div>



    <!-- Calendar Component -->
    <div v-if="events.length !== 0">
      <a-card :bordered="false" class="calendar-display-card">
        <FullCalendar :events="events" :options="calendarOptions" />
      </a-card>
    </div>

  </a-card>
</template>

<script>
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

export default {
  components: {
    FullCalendar,
  },
  data() {
    return {
      events: [null],
      googleAccessToken: null,
      tokenExpirationTime: null,
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: "dayGridMonth",
        headerToolbar: {
          left: "today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        selectable: true,
        dateClick: this.handleDateClick,
      },
    };
  },
  async mounted() {
    //   const response = await this.fetchGoogleAccessToken();
    //   this.googleAccessToken = response?.access_token;
    //   this.tokenExpirationTime = response?.expires_in
    //     ? Date.now() + response.expires_in * 1000
    //     : null;

    //   if (this.googleAccessToken) {
    //     this.fetchEvents();
    //   } else {
    //     this.$message.warning(
    //       "Unable to connect to Google Calendar. Please try reconnecting."
    //     );
    //   }
  },
  methods: {
    async fetchGoogleAccessToken() {
      try {
        const { data } = await axios.post("/api/google-auth/token", {
          userId: this.$store.state.user.id,
        });
        return data;
      } catch (error) {
        console.error("Error fetching access token:", error);
        return null;
      }
    },
    connectGoogleCalendar() {
      const CLIENT_ID = process.env.VUE_APP_GOOGLE_CLIENT_ID;
      const REDIRECT_URI = `${window.location.origin}/auth/callback`;
      const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${SCOPE}&prompt=consent`;

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
          }
        } catch (e) {
          console.error("Error checking popup status:", e);
        }
      }, 1000);
    },
    async fetchEvents() {
      try {
        const response = await axios.get(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            headers: {
              Authorization: `Bearer ${this.googleAccessToken}`,
            },
          }
        );

        this.events = response.data.items.map((event) => ({
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
        }));
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
.description-container {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>