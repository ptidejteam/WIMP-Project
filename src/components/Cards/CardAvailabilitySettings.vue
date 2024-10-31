<template>
  <!-- Connectivity Availability Card -->
  <a-card :bordered="false" class="header-solid h-full" :bodyStyle="{ paddingTop: 0, paddingBottom: 0 }">
    <template #title>
      <div class="header-group">
        <h6 class="font-semibold m-0">Connectivity Availability</h6>
        <a-button @click="resetSettings" icon="redo">Reset</a-button>
      </div>
    </template>
    <ul class="list settings-list">
      <li>
        <h6 class="list-header text-sm text-muted">NETWORK STATUS</h6>
      </li>
      <li>
        <a-switch v-model="notifyDisconnection" @change="toggleNotification" />
        <span>Notify me on disconnection</span>
      </li>
      <li>
        <h6 class="list-header text-sm text-muted m-0">AVAILABILITY STATUS</h6>
      </li>
      <li>
        <a-select v-model="availabilityStatus" @change="updateAvailabilityStatus" placeholder="Select availability status" style="width: 100%;">
          <a-select-option value="available">Available</a-select-option>
          <a-select-option value="away">Away</a-select-option>
          <a-select-option value="do-not-disturb">Do Not Disturb</a-select-option>
          <a-select-option value="offline">Offline</a-select-option>
        </a-select>
      </li>
      <li>
        <h6 class="list-header text-sm text-muted m-0">CUSTOM MESSAGE</h6>
      </li>
      <li>
        <div class="message-group">
          <a-input v-model="customMessage" placeholder="Enter your custom message" @blur="updateAvailabilityBasedOnMessage"/>
          <a-button type="default" @click="updateCustomMessage(customMessage, true)" icon="message"></a-button> 
        </div>
      </li>
      <li>
        <h6 class="list-header text-sm text-muted m-0">CLICKABLE DEFAULT MESSAGES</h6>
      </li>
      <li>
        <div class="tag-container">
          <a-tag v-for="(message, index) in defaultMessages" :key="index" color="blue" class="clickable-tag" @click="updateCustomMessage(message)">
            {{ message }}
          </a-tag>
        </div>
      </li>
      <li>
        <h6 class="list-header text-sm text-muted m-0">DISPLAY MESSAGE TO OTHERS</h6>
      </li>
      <li>
        <a-switch v-model="displayToOthers" @change="updateDisplayOption" />
        <span>Show message to others</span>
      </li>
    </ul>
  </a-card>
  <!-- / Connectivity Availability Card -->
</template>

<script>
import { availabilityService } from "../../services/availability.service"; // Import the availability service
import { AuthenticationService } from "../../services/auth.service"; // Import the authentication service

export default {
  
  props: {
    availabilityStatus: {
      type: String,
      required: true,
      default: 'available'
    }
  },
  data() {
    return {
      notifyDisconnection: true,
      localavailabilityStatus: this.availabilityStatus, // Default availability status
      customMessage: 'I am currently busy. Please leave a message.', // Default custom message
      displayToOthers: false, // Default not displaying message
      userId: '', // Will be set to the current user's ID

      // Predefined default messages
      defaultMessages: [
        'I am currently busy. Please leave a message.',
        'I will get back to you shortly.',
        'Out for lunch, please leave a message.',
        'Currently in a meeting, please do not disturb.',
        'On a break, will respond soon.'
      ],

      // Original values for reset functionality
      originalSettings: {
        notifyDisconnection: true,
        availabilityStatus: 'available',
        customMessage: 'I am currently busy. Please leave a message.', // Include the default message
        displayToOthers: false,
      },
    };
  },
  async created() {
    this.userId = AuthenticationService.currentUserValue["userId"]; // Get current user ID
    // Get the information for the backend to populate with the right informations 
    const availability = await availabilityService.getAvailabilityById(this.userId)
  },
  watch: {
    availabilityStatus(newValue, oldValue) {
      console.log('Availability status changed from', oldValue, 'to', newValue);
      this.localAvailabilityStatus = newValue; // Sync prop with local data
    }
  },
  methods: {
    async updateAvailabilityStatus() {
      try {
        await availabilityService.setAvailabilityStatus(this.userId, this.availabilityStatus);
      } catch (error) {
        console.error('Error updating availability status:', error);
      }
    },
    async updateCustomMessage(message, isCustomInput = false) {
      this.customMessage = message; // Update custom message with the clicked message
      await availabilityService.setCustomMessage(this.userId, this.customMessage);
      // If the input is not a custom input, update the availability status based on the selected message
      if (!isCustomInput) { 
        this.setAvailabilityBasedOnMessage(message);
      }
    },
    async updateDisplayOption() {
      try {
        await availabilityService.setDisplayOption(this.userId, this.displayToOthers);
      } catch (error) {
        console.error('Error updating display option:', error);
      }
    },
    toggleNotification() {
      console.log('Notification for disconnection:', this.notifyDisconnection);
    },
    resetSettings() {
      // Reset to original values
      this.notifyDisconnection = this.originalSettings.notifyDisconnection;
      this.availabilityStatus = this.originalSettings.availabilityStatus;
      this.customMessage = this.originalSettings.customMessage; // Reset to default message
      this.displayToOthers = this.originalSettings.displayToOthers;

      // Optional: show a reset message
      this.$message.info('Settings have been reset to default values.');
    },
    setAvailabilityBasedOnMessage(message) {
      // Update availability status based on message content
      if (message.includes('busy') || message.includes('do not disturb')) {
        this.availabilityStatus = 'do-not-disturb';
      } else if (message.includes('away') || message.includes('out for lunch')) {
        this.availabilityStatus = 'away';
      } else if (message.includes('offline')) {
        this.availabilityStatus = 'offline';
      } else {
        this.availabilityStatus = 'available';
      }
      this.updateAvailabilityStatus(); // Call method to update availability status
    },
    updateAvailabilityBasedOnMessage() {
      this.setAvailabilityBasedOnMessage(this.customMessage);
    }
  },
};
</script>

<style scoped>
.settings-list {
  padding: 0;
}

.list-header {
  margin-bottom: 5px;
}

.header-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.clickable-tag {
  margin: 5px;
  cursor: pointer;
  font-size: inherit;
}

.message-group {
  display: flex;
}
</style>
