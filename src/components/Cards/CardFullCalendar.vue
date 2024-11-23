<template>
  <a-card :bordered="true" :bodyStyle="{ padding: '16px' }">
    <!-- Title -->
    <template #title>
      <div class="header">
        <div style="display: flex; flex-direction: column;">
          <h6 class="font-semibold m-0">Calendar</h6>
          <small style="font-style: italic;">Updated: {{ lastUpdated || "Fetching data..." }}</small>
        </div>
        <a-button icon="redo" type="link" @click="fetchEvents">Refresh</a-button>
      </div>
    </template>

    <template v-if="!calendar">
      <a-skeleton />
    </template>
    <template v-else>
      <!-- Controls -->
      <div style="margin: 5px 12px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="    display: flex;
    align-items: flex-end; ">
          <div>
            <label for="viewSelect" style="font-weight: bold; margin-bottom: 8px; display: block;">
              Calendar View:
            </label>
            <a-select id="viewSelect" v-model="options.defaultView" style="width: 100%;" @change="changeView">
              <a-select-option value="month">Month</a-select-option>
              <a-select-option value="week">Week</a-select-option>
              <a-select-option value="day">Day</a-select-option>
            </a-select>
          </div>
          <a-button @click="calendar.today()" label="Today">Today</a-button>
        </div>
        <div style="    display: flex
;
    flex-direction: row;
    ">
          <a-button @click="calendar.prev()" icon="left"  shape="circle" type="primary"></a-button>
          <h5 style="margin: 0 36px" class="font-semibold">{{ formatDate(calendar.getDateRangeStart(),true) + " ~ " +   formatDate(calendar.getDateRangeEnd(),true) }}</h5>

          <a-button @click="calendar.next()" icon="right"  shape="circle" type="primary"></a-button>
        </div>



        <a-button type="primary" @click="showEventForm">Add Event</a-button>
      </div>
    </template>

    <!-- Calendar Component -->
    <a-spin :spinning="spinning">
      <a-card>
        <div id="calendar" ref="calendarContainer" style="height: 800px;"></div>

      </a-card>
    </a-spin>

    <!-- Event Modal -->
    <a-modal :visible="isEventFormVisible" title="Add/Edit Event">
      <a-form layout="vertical">
        <a-form-item label="Title">
          <a-input v-model="eventForm.title" placeholder="Enter event title" />
        </a-form-item>
        <a-form-item label="Start Date">
          <a-date-picker v-model="eventForm.start" show-time placeholder="Select start date" />
        </a-form-item>
        <a-form-item label="End Date">
          <a-date-picker v-model="eventForm.end" show-time placeholder="Select end date" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Event Details Modal -->
    <a-modal :visible="isEventDetailsVisible" :footer="null">
      <div v-if="selectedEvent">
        <a-card bordered style="background-color: #f5f5f566; border-radius: 8px;">
          <template #title>
            <h3 style="margin: 0; color: #1890ff;">{{ selectedEvent.title }}</h3>
          </template>
          <div style="display: flex; gap: 16px; align-items: center;">
            <a-icon type="calendar" style="font-size: 20px;  gap: 16px; color: #52c41a;" />
            <div>
              <p style="margin: 0;"><strong>Start:</strong> {{ formatDate(selectedEvent.start) }}</p>
              <p style="margin: 0;"><strong>End:</strong> {{ formatDate(selectedEvent.end) }}</p>
            </div>
          </div>
          <a-divider />
          <div style="margin-top: 16px;">
            <p>
              <a-icon type="info-circle" style="color: #1890ff;" /> <strong>Description:</strong>
            </p>
            <p style="margin-left: 24px;">{{ selectedEvent.description || "No description provided" }}</p>
          </div>
          <a-divider />
          <div style="margin-top: 16px;">
            <p>
              <a-icon type="tag" style="color: #faad14;" /> <strong>Category:</strong>
            </p>
            <p style="margin-left: 24px;">{{ selectedEvent.category || "General" }}</p>
          </div>
        </a-card>
      </div>
    </a-modal>

  </a-card>
</template>

<script>
import Calendar from "@toast-ui/calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import { AuthenticationService } from "../../services/auth.service";
import { userService } from "../../services/user.service";

export default {
  props: {
    googleCalendarConnectivity: {
      type: Boolean,
      default: false,
    },
    requestedUser: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      calendar: null,
      events: [],
      spinning: false,
      lastUpdated: this.formatDate(Date.now()),
      userId: AuthenticationService.currentUserValue.userId,
      googleAccessToken: null,
      isEventFormVisible: false,
      isEventDetailsVisible: false,
      options: {
        defaultView: "month",
        useDetailPopup: false, // Disable built-in detail popup
        week: { taskView: false },
        month: { dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
      },
      eventForm: {
        id: null,
        title: "",
        start: null,
        end: null,
      },
      selectedEvent: null,
    };
  },
  computed: {
  },
  async mounted() {
    this.initializeCalendar();
    if (this.googleCalendarConnectivity) {
      await this.fetchEvents();
    }
  },
  methods: {
    // Initialize the calendar with options
    initializeCalendar() {
      this.calendar = new Calendar(this.$refs.calendarContainer, this.options);
      console.log(this.calendar?.today())

      this.calendar.on("clickEvent", this.showEventDetails);
      this.calendar.on("beforeCreateSchedule", this.addQuickEvent);
    },

    // Fetch events from the Google Calendar API
    async fetchEvents() {
      if (this.spinning) return;

      this.spinning = true;
      try {
        const response = await userService.getById(this.userId);
        this.googleAccessToken = response?.data?.googleAccessToken;

        if (!this.googleAccessToken) {
          throw new Error("Google access token is missing.");
        }

        const calendarResponse = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${this.googleAccessToken}`,
            },
          }
        );

        if (!calendarResponse.ok) throw new Error("Failed to fetch events.");

        const data = await calendarResponse.json();
        this.events = data.items.map((event) => ({
          id: event.id,
          calendarId: "cal1",
          title: event.summary || "No Title",
          category: "time",
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          description: event.description || "",
        }));

        this.calendar.clear();
        this.calendar.createEvents(this.events);
        this.lastUpdated = Date.now();
      } catch (error) {
        console.error("Error fetching events:", error);
        this.$message.error("Failed to load events.");
      } finally {
        this.spinning = false;
      }
    },

    // Change the view of the calendar
    changeView(view) {
      this.calendar.changeView(view);
    },

    // Show event details in a modal
    showEventDetails(schedule) {
      const event = this.events.find((e) => e.id === schedule.event.id);
      this.selectedEvent = event || null;
      this.isEventDetailsVisible = true;
    },

    // Close the event details modal
    closeEventDetails() {
      this.isEventDetailsVisible = false;
      this.selectedEvent = null;
    },

    // Show the event form modal
    showEventForm() {
      this.isEventFormVisible = true;
    },

    // Format the date to a readable format
    formatDate(date, isRange = false) {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
      if(isRange) { 
        delete options.hour;
        delete options.minute;
      }
      return  new Date(date).toLocaleString("en-US", options);
    },

    // Add a quick event to the calendar
    addQuickEvent(event) {
      const newEvent = {
        id: `event-${Date.now()}`,
        calendarId: "cal1",
        title: "New Event",
        start: event.start,
        end: event.end,
        description: "Quickly created event.",
      };
      this.events.push(newEvent);
      this.calendar.createEvents([newEvent]);
    },
  },
};
</script>



<style>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
