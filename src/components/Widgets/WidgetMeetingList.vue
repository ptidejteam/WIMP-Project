<template>
    <div class="meetings-list-container">

        <a-list class="meetings-list" item-layout="horizontal" :split="true" v-if="meetings.length"
            :data-source="meetings">
            <a-list-item v-for="item in meetings" :key="item._id">
                <a-list-item-meta :title="item.user.firstName + ' ' + item.user.lastName"
                    :description="formatMeetingTime(item)">
                    <a-avatar slot="avatar" :size="48" shape="round" :src="item.user.avatar" />
                </a-list-item-meta>
                <div>
                    <a-tag v-if="!isExpired(item.start)" :color="getStatusColor(item.status)" class="status-tag">
                        {{ item.status | capitalize }}
                    </a-tag>
                </div>
                <div class="meeting-expiration">
                    <a-tag v-if="isExpired(item.start)" color="red">Expired</a-tag>
                    <a-tag v-else color="green">Active</a-tag>
                </div>
                <template #actions>
                    <span v-if="showActions && item.status === 'pending' && !isExpired(item.start)">
                        <a-button @click="acceptRequest(item._id)" icon="check" shape="round"></a-button>
                        <a-button type="danger" @click="declineRequest(item._id)" icon="close" shape="round"></a-button>
                    </span>
                </template>
            </a-list-item>
        </a-list>

        <div v-else class="empty-state">
            <h6>{{ emptyMessage }}</h6>
        </div>
    </div>
</template>

<script>

export default {
    props: {
        meetings: Array,
        showActions: Boolean,
        emptyMessage: String,
    },
    methods: {
        formatMeetingTime(item) {
            return new Date(item.start).toLocaleString();
        },
        getStatusColor(status) {
            switch (status) {
                case 'pending':
                    return 'gold';
                case 'accepted':
                    return 'green';
                case 'declined':
                    return 'red';
                default:
                    return 'blue'; // Default color for unknown statuses
            }
        },
        acceptRequest(id) {
            this.$emit("accept", id);
        },
        declineRequest(id) {
            this.$emit("decline", id);
        },
        isExpired(startTime) {
            const now = new Date();
            const meetingTime = new Date(startTime);
            return now > meetingTime;
        },
        calculateRemainingTime(startTime) {
            const now = new Date();
            const meetingTime = new Date(startTime);
            const difference = meetingTime - now;

            if (difference <= 0) {
                return 'Meeting in progress';
            }

            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            return `${hours}h ${minutes}m ${seconds}s remaining`;
        },
    },
    filters: {
        capitalize(value) {
            if (!value) return "";
            return value.charAt(0).toUpperCase() + value.slice(1);
        },
    }
};
</script>