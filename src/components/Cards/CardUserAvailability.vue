<template>
    <div>
        <a-card :bordered="true" class="header-solid h-full mb-24" :bodyStyle="{ paddingTop: '14px' }">
            <template #title>
                <span style="display: flex; align-items: center;">
                    <h6 class="font-semibold">User Availability</h6>
                    <span class="refresh-indicator" v-if="loading">
                        <a-spin size="small" />
                        <span style="margin-left: 8px;">Refreshing...</span>
                    </span>
                </span>
                <p>Overview of user statuses and availability</p>
            </template>

            <a-row type="flex" :gutter="[24, 24]" class="user-cards-row">
                <!-- User Column -->
                <a-col :span="24" :md="12" :xl="5" v-for="user in usersAvailability" :key="user.userId">
                    <a-card hoverable :bordered="true" class="user-card"
                        style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                        <div style="padding: 10px;">
                            <div class="user-icon">
                                <img v-if="user.avatar" :src="user.avatar" alt="User Avatar" class="icon" />
                            </div>
                            <a-card-meta style="text-align: center;" :title="`${user.firstName} ${user.lastName}`" />

                            <div class="status-indicators">
                                <!-- Availability Status Badge -->
                                <a-badge :status="getAvailabilityStatus(user.availabilityStatus)"
                                    :text="formatAvailabilityStatus(user.availabilityStatus)" class="availability-badge"
                                    style="font-weight: bold; font-size: 16px;" />
                                <!-- Message Icon and Text -->
                                <div class="custom-message">
                                    <a-icon type="message" style="margin-right: 8px;" />
                                    <span style="text-align: center;">{{
                                        formatCustomMessage(user.customMessage, user.displayToOthers)
                                    }}</span>
                                </div>
                            </div>
                        </div>
                        <template #actions>
                            <a-button 
                                type="primary" 
                                @click="openConfirmationModal(user.userId)" 
                                :disabled="user.availabilityStatus === 'do-not-disturb'"
                                style="margin-top: auto;">
                                <a-icon type="calendar" style="margin-right: 8px;" />
                                Request A Meeting
                            </a-button>
                        </template>
                    </a-card>
                </a-col>
            </a-row>
        </a-card>

        <!-- Confirmation Modal -->
        <a-modal :visible="isModalVisible" title="Confirm Meeting Request" @ok="confirmRequest" @cancel="closeModal">
            <p>Are you sure you want to send a meeting request to this user?</p>
            <p>
                Suggest another time (optional):
                <a-time-picker v-model="alternateTime" format="HH:mm" />
            </p>
        </a-modal>
    </div>
</template>

<script>
import { userService } from '../../services/user.service';
import { meetingService } from '../../services/meeting.service';
import { AuthenticationService } from '../../services/auth.service';
import { availabilityService } from '../../services/availability.service';

export default {
    data() {
        return {
            usersAvailability: [],
            refreshInterval: null,
            loading: true,
            isModalVisible: false,
            userId: null,
            alternateTime: '',
        };
    },
    mounted() {
        this.fetchUsers();
        this.startAutoRefresh();
    },
    beforeDestroy() {
        this.stopAutoRefresh();
    },
    methods: {
        formatAvailabilityStatus(val) {
            return String(val).charAt(0).toUpperCase() + String(val).slice(1);
        },

        formatCustomMessage(val, isDisplayed) {
            return val === "" || !isDisplayed ? "No Messages" : val;
        },
        async fetchUsers() {
            this.loading = true; // Set loading state
            try {
                const response = await userService.getAllWithAvailability();
                const usersAvailability = response.data;

                // Fetch user information for each user
                const userPromises = usersAvailability.map(user => userService.getById(user.userId));
                const users = await Promise.all(userPromises);

                // Combine users with user information
                this.usersAvailability = usersAvailability.map((user, index) => ({
                    ...user,
                    ...users[index].data // Assuming each user response has a data field
                }));
            } catch (error) {
                console.error('Error fetching users:', error);
                this.$message.error('Failed to load user availability.'); // User feedback for errors
            } finally {
                setTimeout(() => {
                    this.loading = false; // Reset loading state
                }, 500);
            }
        },
        startAutoRefresh() {
            this.refreshInterval = setInterval(this.fetchUsers, 5000);
        },
        stopAutoRefresh() {
            clearInterval(this.refreshInterval);
        },
        getAvailabilityStatus(status) {
            // Define the status for the badge
            switch (status.toLowerCase()) {
                case 'available':
                    return 'success';
                case 'away':
                    return 'warning';
                case 'do-not-disturb':
                    return 'error';
                default:
                    return 'default';
            }
        },
        openConfirmationModal(userId) {
            this.userId = userId; // Store the user ID for the request
            this.isModalVisible = true; // Show the confirmation modal
            this.alternateTime = ''; // Reset alternate time input
        },
        closeModal() {
            this.isModalVisible = false; // Hide the modal
            this.alternateTime = ''; // Reset alternate time input
        },
        async confirmRequest() {
            console.log(`Attempting to send a meeting request for user ID: ${this.selectedUserId}`);

            // Constructing the request object
            const request = {
                requesterId: AuthenticationService.currentUserValue["userId"],
                requestedUserId: this.selectedUserId,
                time: this.alternateTime ? new Date(this.alternateTime).getTime() : Date.now(), // Use alternate time if provided
            };

            try {
                // Check if the requested user is available before sending the meeting request
                const availabilityResponse = await availabilityService.getAvailabilityById(this.selectedUserId);
                const isAvailable = availabilityResponse.data;
                console.log(availabilityResponse)
                // Proceed only if the user is online and not in 'do-not-disturb' status
                if (isAvailable.isOnline && isAvailable.availabilityStatus !== 'do-not-disturb') {
                    const response = await meetingService.createMeeting(request);
                    this.$message.success('Meeting request sent successfully!'); // User feedback for success
                } else {
                    this.$message.info("The user is currently busy! Please try another time.");
                }
            } catch (error) {
                console.error('Error creating meeting:', error);
                this.$message.error('Failed to send meeting request.'); // User feedback for errors
            } finally {
                this.closeModal(); // Close the modal after processing
            }
        },

    },
};
</script>

<style scoped>
.refresh-indicator {
    text-align: center;
}

.user-cards-row {
    display: flex;
    flex-wrap: wrap;
    /* Allow wrapping for smaller screens */
}

.user-card {
    flex: 1;
    /* Allow the cards to stretch equally */
    min-width: 240px;
    /* Set a minimum width */
    max-width: 300px;
    /* Set a maximum width for uniformity */
    margin-bottom: 16px;
    /* Space between cards */
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    /* Stack children vertically */
    height: 100%;
    /* Ensure all cards stretch to full height */
}

.user-icon {
    text-align: center;
    margin-bottom: 8px;
}

.icon {
    width: 100px;
    height: 100px;
    border-radius: 50%;
}

.status-indicators {
    margin-top: 8px;
    display: flex;
    justify-content: center;
    align-content: space-around;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
    /* Allow this section to grow */
}

.availability-badge {
    margin-bottom: 8px;
    font-weight: bold;
    /* Make the badge text bold */
}

.custom-message {
    display: flex;
    align-items: center;
    color: #595959;
}

.end {
    display: flex;
    justify-content: center;
    margin-top: 10%;
}
</style>
