<template>
  <a-card :bordered="true" :bodyStyle="{ padding: '16px' }">
    <!-- Title -->
    <template #title>
      <div class="header">
        <div style="display: flex; flex-direction: column;">
          <h6 class="font-semibold m-0">Calendar</h6>
          <small style="font-style: italic;">Updated: {{ lastUpdated | dateTime }}</small>
        </div>
        <a-alert v-if="!googleCalendarConnectivity && isSurfer" message="Your google calendar is not connected"
          type="warning" show-icon />
        <a-button icon="redo" type="link" @click="fetchData">Refresh</a-button>
      </div>
    </template>

    <template v-if="!calendar">
      <a-skeleton />
    </template>
    <template v-else>
      <!-- Controls -->
      <div style="margin: 5px 12px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style=" display: flex; align-items: flex-end; ">

          <a-select id="viewSelect" v-model="options.defaultView" style="width: 100%;" @change="changeView">
            <a-select-option value="month">Month</a-select-option>
            <a-select-option value="week">Week</a-select-option>
            <a-select-option value="day">Day</a-select-option>
          </a-select>
          <a-button @click="calendar.today()" label="Today">Today</a-button>
        </div>
        <div style="display: flex;flex-direction: row;">
          <a-button @click="calendar.prev()" icon="left" shape="circle" type="primary"></a-button>
          <h5 style="margin: 0 36px" class="font-semibold">{{ calendar.getDateRangeStart() | date }} ~
            {{ calendar.getDateRangeEnd() | date }}</h5>
          <a-button @click="calendar.next()" icon="right" shape="circle" type="primary"></a-button>
        </div>
        <a-button @click="showEventForm" type="primary" shape="round" icon="plus" v-if="!isSurfer">Request</a-button>
        <div v-else></div>
      </div>
    </template>

    <!-- Calendar Component -->
    <a-spin :spinning="spinning">
      <a-card>
        <div id="calendar" ref="calendarContainer" style="height: 800px;"></div>
      </a-card>
    </a-spin>

    <!-- Event Modal -->
    <EventFormModal :visible="isEventFormVisible" @close="closeEventForm" @submit="handleFormSubmit" />

    <!-- Event Details Modal -->
    <a-modal :visible="isEventDetailsVisible" title="Event Details" @ok="closeEventDetails" @cancel="closeEventDetails">
      <template v-if="selectedEvent">
        <div class="event-container">
          <h3 class="event-title">{{ selectedEvent.title }}</h3>
          <div class="event-details">
            <a-icon type="calendar" class="event-icon event-calendar-icon" />
            <strong>Time:</strong>
            <div>
              <p><strong>Start:</strong> {{ selectedEvent.start | dateTime }}</p>
              <p><strong>End:</strong> {{ selectedEvent.end | dateTime }}</p>
            </div>
          </div>
          <a-divider></a-divider>
          <!-- Location Section -->
          <div class="event-details">
            <a-icon type="environment" class="event-icon event-location-icon" />
            <strong>Location:</strong>
            <p class="event-text">{{ selectedEvent.location || "Location not specified" }}</p>
          </div>
          <a-divider></a-divider>

          <div class="event-details">
            <a-icon type="info-circle" class="event-icon event-info-icon" />
            <strong>Description:</strong>
            <p class="event-text">{{ selectedEvent.description || "No description provided" }}</p>
          </div>
          <a-divider></a-divider>

          <div class="event-details">
            <a-icon type="tag" class="event-icon event-category-icon" />
            <strong>Category:</strong>
            <p class="event-text">{{ selectedEvent.category | capitalize }}</p>
          </div>
        </div>
      </template>
    </a-modal>


  </a-card>
</template>

<script>
import Calendar from "@toast-ui/calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import { AuthenticationService } from "../../services/auth.service";
import { meetingService } from "../../services/meeting.service";
import { Role } from "../../helpers/roles";
import EventFormModal from "../Modals/EventFormModal.vue";
export default {
  components: {
    EventFormModal
  },
  props: {
    googleCalendarConnectivity: {
      type: Boolean,
      default: false,
    },
    requestedUser: {
      type: String,
      default: ""
    },

  },
  data() {
    return {
      calendar: null,
      events: [],
      spinning: false,
      lastUpdated: null,
      userId: AuthenticationService.currentUserValue.userId,
      googleAccessToken: null,
      isEventFormVisible: false,
      isEventDetailsVisible: false,
      Role: Role,
      options: {
        defaultView: "week",
        useDetailPopup: false, // Disable built-in detail popup
        week: { taskView: false },
        isReadOnly:true,
        month: { dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
      },

      selectedEvent: null,
    };
  },

  watch: {
    googleCalendarConnectivity: {
      handler: 'fetchData',
    },
  },
  async mounted() {
    this.initializeCalendar();
    // if (this.googleCalendarConnectivity) {
    await this.fetchData();
    // }
    // Subscribe to a WebSocket event
    this.$subscribeToEvent(this.handleRefresh);
  },
  computed: {
    isSurfer() {
      return AuthenticationService.currentUserValue?.roles === Role.Surfer;
    }
  },
  methods: {

    handleRefresh(event) {
      if (event.data === 'meeting') {
        this.fetchData();
      }
    },
    // Initialize the calendar with options
    initializeCalendar() {
      this.calendar = new Calendar(this.$refs.calendarContainer, this.options);
      this.calendar.on("clickEvent", this.showEventDetails);
    },
    async fetchData() {
      if (this.spinning) return;
      this.spinning = true;
      try {
        const response = await meetingService.getMeetingById(this.userId);
        response.data.forEach(item => {
          item.id = item._id; // Assign _id to id
          delete item._id;    // Remove _id
          delete item.__v;
        });

        this.events = response.data.map((event) => {
          let backgroundColor;
          switch (event.status) {
            case "pending":
              backgroundColor = "#ecf0f1"; // Orange for pending
              break;
            case "confirmed":
              backgroundColor = "#2ecc7166"; // Green for confirmed
              break;
            default:
              backgroundColor = "#3498db"; // Default blue color
          }

          return {
            id: event.id,
            title: event.summary || "No Title",
            category: "time",
            location: event.location,
            start: event.start,
            end: event.end,
            description: event.description || "",
            backgroundColor: backgroundColor,
            isPending : event.status === "pending",
            isVisible: event.status !== "rejected"
          };
        });

        //console.log(this.events);
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

    async handleFormSubmit(formData) {
      try {
        await meetingService.createMeeting(formData);
      } catch (err) {
        this.$message.error(err.response.data);

      }

      console.log("Form Submitted:", formData);
      // Handle form data submission (e.g., send to API or save to store)
    },
    // Show event details in a modal
    showEventDetails(schedule) {
      const event = this.events.find((e) => e.id === schedule.event.id);
      this.selectedEvent = event || null;
      this.isEventDetailsVisible = true;
    },

    // Close the Event Details modal
    closeEventDetails() {
      this.isEventDetailsVisible = false;
      this.selectedEvent = null;
    },

    closeEventForm() {
      this.isEventFormVisible = false;
    },

    // Show the event form modal
    showEventForm() {
      this.isEventFormVisible = true;
    },

  },
  filters: {
    capitalize(value) {
      if (!value) return "";
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    dateTime(value) {
      return !value ? "" : new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    date(value) {
      return !value ? "" : new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    }
  },
};
</script>



<style>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.event-container {
  padding: 16px;
}

.event-title {
  margin-bottom: 16px;
  color: #1890ff;
  font-size: 1.5em;
}

.event-details {
  display: flex;
  gap: 16px;
}

.event-icon {
  font-size: 20px;
}

.event-calendar-icon {
  color: #52c41a;
}

.event-info-icon {
  color: #1890ff;
}

.event-category-icon {
  color: #faad14;
}

.event-section {
  margin-top: 16px;
}

.event-text {
  margin-left: 24px;
}
</style>
