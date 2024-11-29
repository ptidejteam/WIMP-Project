<template>
    <a-card :bordered="true" :bodyStyle="{ paddingTop: '16px' }">
        <template #title>
            <div class="header">
                <div>
                    <span style="display: flex; align-items: center;">
                        <h6 class="font-semibold">User Availability</h6>
                        <span class="refresh-indicator" v-if="loading">
                            <a-spin size="small" />
                            <span style="margin-left: 8px;">Refreshing...</span>
                        </span>
                    </span>
                    <p>Overview of users statuses and availability</p>
                </div>
                <div>
                    <a-button icon="redo" type="link" @click="fetchData">Refresh</a-button>
                </div>
            </div>


        </template>
        <template v-if="!usersAvailability">
            <a-skeleton />
        </template>
        <a-row v-else type="flex" :gutter="[24, 24]" class="user-cards-row">
            <!-- User Column -->
            <a-col v-for="user in filteredAvailibilty" :key="user.userId">
                <a-card hoverable :bordered="true" class="user-card">
                    <div>
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
                                <!-- <a-icon type="message" style="margin-right: 8px;" /> -->
                                <span style="text-align: center;">"{{
                                    formatCustomMessage(user.customMessage, user.displayToOthers)
                                }}"</span>
                            </div>
                        </div>
                    </div>
                    <template #actions>
                        <a-button type="primary" @click="isEventFormVisible = true"
                            :disabled="user.availabilityStatus === 'do-not-disturb'" icon="plus" shape="round">
                            Request
                        </a-button>
                    </template>
                </a-card>
            </a-col>
        </a-row>
            <!-- Event Modal -->
        <!-- <MeetingFormModal :visible="isEventFormVisible" /> -->
    </a-card>


</template>

<script>
import { userService } from '../../services/user.service';
import { AuthenticationService } from '../../services/auth.service';
import { Role } from '../../helpers/roles';
import MeetingFormModal from '../Modals/MeetingFormModal.vue';
export default {
    components: { 
        MeetingFormModal
    },
    data() {
        return {
            isEventFormVisible : true,
            usersAvailability: null,
            userId: AuthenticationService.currentUserValue.userId,
            userRole : AuthenticationService.currentUserValue.roles,
            loading: true,
            isModalVisible: false,
        };
    },
    computed: { 
        filteredAvailibilty() { 
            return this.userRole < Role.Member ? this.usersAvailability?.filter(o => o.permissionLevel >= Role.Member) : this.usersAvailability;
        }
    },
    mounted() {
        this.fetchData();
        this.$subscribeToEvent(this.handleRefresh);
    },
    methods: {
        handleRefresh(e) {
            console.log(e);
            if (e.data === 'availability') { this.fetchData(); }
        },
        formatAvailabilityStatus(val) {
            return String(val).charAt(0).toUpperCase() + String(val).slice(1);
        },

        formatCustomMessage(val, isDisplayed) {
            return val === "" || !isDisplayed ? "No Messages" : val;
        },
        async fetchData() {
            this.loading = true;
            try {
                // Fetch users with availability
                const response = await userService.getAllWithAvailability();
                const availability = response?.data || [];

                // Initialize a map for caching user details if not already done
                if (!this.userDetailsCache) {
                    this.userDetailsCache = new Map();
                }

                // Fetch only the users that are not cached
                const userPromises = availability.map(async (user) => {
                    if (!this.userDetailsCache.has(user.userId)) {
                        const userDetailResponse = await userService.getById(user.userId);
                        this.userDetailsCache.set(user.userId, userDetailResponse?.data || {});
                    }
                    return this.userDetailsCache.get(user.userId);
                });

                const users = await Promise.all(userPromises);

                // Combine availability with cached or newly fetched user information
                this.usersAvailability = availability.map((user, index) => ({
                    ...user,
                    ...users[index]
                }));
                console.log(this.filteredAvailibilty);
            } catch (error) {
                this.$message.error('Failed to load user availability.');
            } finally {
                this.loading = false;
            }
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
        },
        closeModal() {
            this.isModalVisible = false; // Hide the modal
        },
    }
};
</script>

<style scoped>
.ant-card-actions {
    margin: 0;
    padding: 0;
    list-style: none;
    background: #fafafa;
    border-top: 0px;
    zoom: 1;
}

.refresh-indicator {
    text-align: center;
}

.user-cards-row {
    display: flex;
    justify-content: center;
    align-items: center;
}

.user-card {
    flex: 1;
    /* Allow the cards to stretch equally */
    min-width: 240px;
    /* Set a minimum width */
    max-width: 300px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;

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

.ant-card-actions {
    border-top: 0px solid #e8e8e8;
}

.header {
    display: flex;
}
</style>