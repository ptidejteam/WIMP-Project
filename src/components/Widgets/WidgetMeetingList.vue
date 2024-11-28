<template>
    <div class="meetings-list-container">
  
      <a-list
        class="meetings-list"
        item-layout="horizontal"
        :split="true"
        v-if="meetings.length"
        :data-source="meetings"
      >
        <a-list-item v-for="item in meetings" :key="item._id">
          <a-list-item-meta
            :title="item.user.firstName + ' ' + item.user.lastName"
            :description="formatMeetingTime(item)"
          >
            <a-avatar slot="avatar" :size="48" shape="round" :src="item.user.avatar" />
          </a-list-item-meta>
          <div>
            <a-tag :color="getStatusColor(item.status)" class="status-tag">
              {{ item.status | capitalize }}
            </a-tag>
          </div>
          <template #actions>
            <span v-if="showActions && item.status === 'pending'">
              <a-button @click="acceptRequest(item._id)" icon="check" shape="round"></a-button>
              <a-button
                type="danger"
                @click="declineRequest(item._id)"
                icon="close"
                shape="round"
              ></a-button>
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
    },
  };
  </script>
  