<template>
    <a-modal :visible="visible" title="Add/Edit Meeting" :footer="null" @cancel="closeModal">
        <a-form :form="form" @submit="handleSubmit" layout="vertical">
            <!-- Title Field -->
            <a-form-item label="Title" :hasFeedback="true">
                <a-input
                    v-decorator="['summary', { rules: [{ required: true, message: 'Please enter the meeting title' }] }]"
                    placeholder="Enter meeting summary" />
            </a-form-item>

            <!-- Requester (Disabled, Bound to Current User) -->
            <a-form-item label="Requester">
                <a-input v-model="requesterId" disabled placeholder="Requester is Me" />
            </a-form-item>

            <!-- Requested User Dropdown -->
            <a-form-item label="Requested User" :hasFeedback="true">
                <a-select
                    v-decorator="['requestedUserId', { rules: [{ required: true, message: 'Please select a user' }] }]"
                    @change="handleUserChange" placeholder="Select requested user">
                    <a-select-option v-for="user in filteredUsers" :key="user._id" :value="user._id">
                        {{ fullname(user) }}
                    </a-select-option>
                </a-select>
            </a-form-item>

            <!-- Workspace Selection -->
            <a-form-item v-if="!isVirtual" label="Location" :hasFeedback="true">
                <a-select
                    v-decorator="['location', { rules: [{ required: true, message: 'Please select a location' }] }]"
                    placeholder="Select meeting location">
                    <a-select-option v-for="workspace in requestedUserWorkspaces" :key="workspace.id"
                        :value="workspace.id">
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
                <span>Suggested Durations: </span>
                <a-button v-for="duration in [15, 30, 60]" :key="duration" style="gap:15px;"
                    @click="suggestDuration(duration)">
                    {{ duration }} mins
                </a-button>
            </div>
            <!-- Start Date and End Date -->
            <div style="display: flex; justify-content: space-between;">
                <a-form-item label="Start Date" :hasFeedback="true">
                    <a-date-picker
                        v-decorator="['start', { rules: [{ required: true, message: 'Please select a start date' }] }]"
                        show-time placeholder="Select start date" />
                </a-form-item>

                <a-form-item label="End Date" :hasFeedback="true">
                    <a-date-picker
                        v-decorator="['end', { rules: [{ required: true, message: 'Please select an end date' }] }]"
                        show-time placeholder="Select end date" />
                </a-form-item>
            </div>

            <!-- Description -->
            <a-form-item label="Description">
                <a-textarea v-decorator="['description', { rules: [{ required: false }] }]"
                    placeholder="Enter meeting description" />
            </a-form-item>

            <!-- Form Actions -->
            <div style="text-align: right;">
                <a-button @click="closeModal" style="margin-right: 8px;">Cancel</a-button>
                <a-button type="primary" @click="handleSubmit">Submit</a-button>
            </div>
        </a-form>
    </a-modal>
</template>


<script>
import { AuthenticationService } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import moment from "moment";

export default {
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            form: this.$form.createForm(this), // Create Ant Design form instance
            users: null,
            requesterId: AuthenticationService.currentUserValue.userId, // Current user ID
            isVirtual: false,
            requestedUserWorkspaces: [], // Dynamically updated based on selected user
        };
    },
    computed: {
        filteredUsers() {
            return this.users
                ? this.users.filter((user) => user._id !== this.requesterId)
                : [];
        },
    },
    watch: {
        isVirtual(val) {
            if (val) {
                this.requestedUserWorkspaces = []; // Clear workspace when virtual meeting is selected
            }
        },
    },
    mounted() {
        userService.getAll().then((response) => {
            this.users = response.data;
        });
    },
    methods: {
        fullname(user) {
            return `${user.firstName} ${user.lastName}`;
        },
        handleUserChange(userId) {
            const user = this.users.find((u) => u._id === userId);
            this.requestedUserWorkspaces = user ? user.workSpaces : [];
        },
        closeModal() {
            this.form.resetFields(); // Reset form fields
            this.$emit("close"); // Notify parent component
        },
        suggestDuration(duration) {
            // Get the current start date or default to now
            const startDate = this.form.getFieldValue("start") || moment();
            const endDate = moment(startDate).add(duration, "minutes");

            // Update form fields with the suggested duration
            this.form.setFieldsValue({
                start: startDate,
                end: endDate,
            });
        },
        updateEndDate(startDate) {
            // If a start date is set, update the end date to ensure consistency
            const endDate = this.form.getFieldValue("end");
            if (!endDate || moment(startDate).isAfter(endDate)) {
                this.form.setFieldsValue({
                    end: moment(startDate).add(30, "minutes"), // Default duration: 30 mins
                });
            }
        },
        handleSubmit() {
            this.form.validateFields((errors, values) => {
                if (!errors) {
                    const formData = {
                        ...values,
                        requesterId: this.requesterId,
                    };
                    this.$emit("submit", formData); // Emit validated form data
                    this.closeModal();
                }
            });
        },
    },
};
</script>
