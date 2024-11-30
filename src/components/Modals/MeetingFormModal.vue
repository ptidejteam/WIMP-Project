<template>
    <a-modal :visible="visible" title="Request Meeting" :footer="null" @cancel="closeModal" :width="1600">
        <template v-if="!requestedUser">
            <a-skeleton />
        </template>
        <a-row v-else :gutter="32">
            <!-- Calendar Section -->
            <a-col :span="16">
                <a-card>
                    <div style="display: flex; flex-direction: row;">
                        <!-- Navigation buttons -->
                        <div style="display: flex; flex-direction: row; margin-bottom: 12px;">
                            <a-button @click="goToPrevDate" icon="left" shape="circle"
                                style="margin-right: 8px;"></a-button>
                            <a-button @click="goToToday" style="margin-right: 8px;">Today</a-button>
                            <a-button @click="goToNextDate" icon="right" shape="circle"></a-button>
                        </div>
                        <!-- Description about the calendar -->
                        <p style="font-size: 14px; margin-bottom: 16px; text-align: center;">
                            You can consult the calendar to choose the right time for the meeting. Use the buttons below
                            to
                            navigate through the calendar, or click "Today" to jump to the current date.
                        </p>
                    </div>
                    <!-- Calendar view -->
                    <div id="calendar" ref="calendarContainer" style="height: 600px;"></div>
                </a-card>
            </a-col>

            <!-- Form Section -->
            <a-col :span="8">
                <a-form :form="form" @submit="handleSubmit" layout="vertical">
                    <!-- Title Field -->
                    <a-form-item label="Title" has-feedback>
                        <a-input v-model="form.title" placeholder="Enter meeting summary"
                            :rules="[{ required: true, message: 'Please enter the meeting title' }]" />
                    </a-form-item>

                    <!-- Requester Field (Disabled) -->
                    <a-form-item label="Requester (Me)">
                        <a-input v-model="requesterId" disabled placeholder="Requester is Me" />
                    </a-form-item>

                    <!-- Requested User Dropdown -->
                    <a-form-item label="Requested User" :hasFeedback="true">
                        <a-input v-model="userId" disabled placeholder="Requester is Me" />
                    </a-form-item>

                    <!-- Workspace Selection -->

                    <a-form-item v-if="!isVirtual" label="Location" :hasFeedback="true">
                        <a-select
                            v-decorator="['location', { rules: [{ required: true, message: 'Please select a location' }] }]"
                            placeholder="Select meeting location">
                            <a-select-option v-for="workspace in requestedUser.workSpaces" :key="workspace.id"
                                :value="workspace.name">
                                {{ workspace.name }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                    <!-- Virtual Meeting Checkbox -->
                    <a-form-item>
                        <a-checkbox v-model="isVirtual">Is this a virtual meeting?</a-checkbox>
                    </a-form-item>

                    <!-- Suggested Time Duration Buttons -->
                    <div style="margin-bottom: 12px;">
                        <span>Durations:</span>
                        <a-button v-for="duration in [15, 30, 60, 120]" :key="duration" style="margin: 4px"
                            @click="suggestDuration(duration)">
                            {{ duration }} mins
                        </a-button>
                    </div>

                    <!-- Start Date and End Date -->
                    <div style="display: flex; justify-content: space-between;">
                        <a-form-item label="Start Date" :hasFeedback="true">
                            <a-date-picker
                                v-decorator="['start', { rules: [{ required: true, message: 'Please select a start date' }] }]"
                                :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                                placeholder="Select start date" />
                        </a-form-item>

                        <a-form-item label="End Date" :hasFeedback="true">
                            <a-date-picker
                                v-decorator="['end', { rules: [{ required: true, message: 'Please select an end date' }] }]"
                                :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                                placeholder="Select end date" />
                        </a-form-item>
                    </div>

                    <!-- Description -->
                    <a-form-item label="Description">
                        <a-textarea v-model="form.description" placeholder="Enter meeting description" autosize />
                    </a-form-item>

                    <!-- Form Actions -->
                    <div style="text-align: right;">
                        <a-button @click="closeModal" style="margin-right: 8px;">Cancel</a-button>
                        <a-button type="primary" html-type="submit">Submit</a-button>
                    </div>
                </a-form>
            </a-col>
        </a-row>
    </a-modal>
</template>

<script>
import Calendar from "@toast-ui/calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
// import moment from "moment";
import moment from "moment-timezone";

import { AuthenticationService } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import { meetingService } from "../../services/meeting.service";

export default {
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        userId: {
            type: String,
            require: true
        }
    },
    data() {
        return {
            form: this.$form.createForm(this),
            requestedUser: null, // Declare upfront
            requesterId: AuthenticationService.currentUserValue.userId,
            isVirtual: false,
            requestedUserWorkspaces: [], // Declare upfront
            calendar: null,
            events: [], // Declare events upfront to avoid runtime additions
            options: {
                defaultView: "day",
                useDetailPopup: false,
                isReadOnly: true,
                week: { taskView: false },
                month: { dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
            },
            spinning: false, // Declare spinning if used in fetchData
            lastUpdated: null, // Declare if used in fetchData
        };
    },

    watch: {
        visible(val) {
            if (val) {

                    this.initializeCalendar();
                    this.fetchUsers();
                    this.fetchData();
            } else if (this.calendar) {
                this.calendar.clear();
                this.calendar.destroy();
                this.calendar = null;
            }
        },
        isVirtual(val) {
            if (val) {
                this.requestedUserWorkspaces = [];
            }
        },
    },
    methods: {
        onDateChange() {
            const startDate = this.form.getFieldValue("start");
            if (startDate) {
                this.calendar.setDate(startDate);
            }
        },
        async fetchUsers() {
            const response = await userService.getById(this.userId);
            this.requestedUser = response.data;
        },

        initializeCalendar() {
                this.calendar = new Calendar(this.$refs.calendarContainer, this.options);
        },

        async fetchData() {
            if (this.spinning) return;
            this.spinning = true;
            try {
                const response = await meetingService.getMeetingById(this.userId);
                response.data.forEach(item => {
                    item.id = item._id;
                    delete item._id;
                    delete item.__v;
                });

                this.events = response.data.map((event) => {
                    let backgroundColor;
                    switch (event.status) {
                        case "pending":
                            backgroundColor = "#ecf0f1";
                            break;
                        case "confirmed":
                            backgroundColor = "#2ecc7166";
                            break;
                        default:
                            backgroundColor = "#3498db";
                    }

                    return {
                        id: event.id,
                        title: event.summary || "No Title",
                        category: "time",
                        location: event.location,
                        start: moment(event.start),
                        end: moment(event.end),
                        description: event.description || "",
                        backgroundColor: backgroundColor,
                        isPending: event.status === "pending",
                        isVisible: event.status !== "rejected"
                    };
                });

                this.calendar.clear();
                this.calendar.createEvents(this.events);
                this.lastUpdated = Date.now();
            } catch (error) {
                this.$message.error("Failed to load events.");
            } finally {
                this.spinning = false;
            }
        },

        fullname(user) {
            return `${user.firstName} ${user.lastName}`;
        },

        handleUserChange(userId) {
            this.requestedUserWorkspaces = user ? user.workSpaces : [];
        },

        closeModal() {
            this.form.resetFields();
            this.$emit("close");
        },
        // Check if the proposed meeting time overlaps with existing events
        checkForOverlaps(start, end) {
            return this.events.some(event => {
                return (moment(start).isBefore(moment(event.end)) && moment(end).isAfter(moment(event.start)));
            });
        },

        suggestDuration(duration) {
            const startDate = this.form.getFieldValue("start") || moment();
            const endDate = moment(startDate).add(duration, "minutes");
            this.form.setFieldsValue({ start: startDate, end: endDate });
        },

        handleSubmit(e) {
            e.preventDefault();
            this.form.validateFields(async (err, values) => {
                if (!err) {
                    const formData = {
                        ...values,
                        requesterId: this.requesterId,
                        requestedUserId : this.userId 
                    };
                    const { start, end } = this.form.getFieldsValue();
                    // Check for overlaps before submitting the form
                    if (this.checkForOverlaps(start, end)) {
                        this.$message.error("The selected time overlaps with an existing meeting.");
                        return;
                    }
                    try {
                        console.log(formData);
                        await meetingService.createMeeting(formData);
                        this.closeModal();
                        this.$message.success("Meeting requested successfully");
                    } catch (error) {
                        console.error("Error creating meeting:", error);
                        this.$message.error("Failed to create meeting.");
                    }
                }
            });
        },

        goToPrevDate() {
            this.calendar.prev();
        },

        goToNextDate() {
            this.calendar.next();
        },

        goToToday() {
            this.calendar.today();
        }


    }
};
</script>
