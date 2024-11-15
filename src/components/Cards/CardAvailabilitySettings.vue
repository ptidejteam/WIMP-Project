<template>
  <!-- Connectivity Availability Card -->
  <a-card :bordered="false" class="header-solid h-full" :bodyStyle="{ paddingTop: 0, paddingBottom: 0 }">
    <template #title>
      <div class="header-group">
        <h6 class="font-semibold m-0">Availability Control Panel</h6>
        <a-button @click="resetSettings" icon="redo">Reset</a-button>
      </div>
      <a-divider />

    </template>
    <template v-if="!availability">
      <a-skeleton />
    </template>

    <ul v-else class="list settings-list">
      <li>
        <p class="list-header text-sm text-muted">Manage and display your network connection status and availability
          settings for others to view. Set your current availability, add custom messages, and control message
          visibility
        </p>
      </li>
      <li>
        <h6 class="list-header text-sm text-muted m-0">AVAILABILITY STATUS</h6>
      </li>
      <li>
        <a-select v-model="availability.availabilityStatus" @change="updateAvailabilityStatus"
          placeholder="Select availability status" style="width: 100%;">
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
          <a-input v-model="availability.customMessage" placeholder="Enter your custom message"
            @blur="updateAvailabilityBasedOnMessage" />
          <!-- <a-button type="primary" @click="updateCustomMessage(customMessage, true)" icon="plane"></a-button> -->
        </div>
      </li>
      <li>
        <h6 class="list-header text-sm text-muted m-0">CLICKABLE DEFAULT MESSAGES</h6>
      </li>
      <li>
        <div>
          <!-- Instruction text for the user -->
          <p v-if="userRole === Role.Master" class="instruction-text">
            Click on any default message to customize it, or add a new message by clicking the "New default message" tag
            below.
          </p>

          <!-- Existing tag and input components -->
          <a-tag v-for="(message, index) in availability.defaultMessages" :key="index" color="blue"
            class="clickable-tag" @click="updateCustomMessage(message)"
            :closable="userRole === Role.Master" @close="userRole === Role.Master ? handleClose(message) : null">
            {{ message }}
          </a-tag>

          <a-input v-if="inputVisible && userRole === Role.Master" ref="input" type="text" size="small"
            :value="inputValue" @change="handleInputChange" @blur="handleInputConfirm"
            @keyup.enter="handleInputConfirm" />

          <a-tag v-else-if="userRole === Role.Master" style="background: #fff; border-style: dashed;"
            @click="showInput">
            <a-icon type="plus" /> New default message
          </a-tag>
        </div>



      </li>

      <li>
        <h6 class="list-header text-sm text-muted m-0">DISPLAY MESSAGE TO OTHERS</h6>
      </li>
      <li>
        <a-switch v-model="availability.displayToOthers" @change="updateDisplayOption" />
        <span>Show message to others</span>
      </li>
    </ul>
  </a-card>
  <!-- / Connectivity Availability Card -->
</template>

<script>
import { availabilityService } from "../../services/availability.service"; // Import the availability service
import { AuthenticationService } from "../../services/auth.service"; // Import the authentication service
import { Role } from "../../helpers/roles";
export default {


  data() {
    return {
      availability: null,
      userId: AuthenticationService.currentUserValue["userId"], // Will be set to the current user's ID
      userRole: AuthenticationService.currentUserValue["roles"],
      Role: Role,
      inputVisible: false,
      inputValue: '',
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
    this.availability = (await availabilityService.getAvailabilityById(this.userId)).data;
  },

  methods: {

    showInput() {
      this.inputVisible = true;
      this.$nextTick(function () {
        this.$refs.input.focus();
      });
    },

    handleInputChange(e) {
      this.inputValue = e.target.value;
    },

    async handleClose(removedTag) {
      const defaultMessages = this.availability.defaultMessages.filter(tag => tag !== removedTag);
      try {
        await availabilityService.setDefaultMessages({ defaultMessages });
        this.inputVisible = false;
      } catch (error) {
        this.$notification['error']({ message: 'Error updating default messages', description: error.response.data.message });

      }
    },

    async handleInputConfirm() {
      const inputValue = this.inputValue;
      if (inputValue && this.availability.defaultMessages.indexOf(inputValue) === -1) {
        const defaultMessages = [...this.availability.defaultMessages, inputValue];
        try {
          await availabilityService.setDefaultMessages({ defaultMessages });
          this.inputVisible = false;
        } catch (error) {
          this.$notification['error']({ message: 'Error updating default messages', description: error.response.data.message });

        }
      }
    },
    async updateAvailabilityStatus() {
      try {
        await availabilityService.setAvailabilityStatus(this.userId, this.availability.availabilityStatus);
        //await availabilityService.updateAvailability(this.availability);

      } catch (error) {
        this.$notification['error']({ message: 'Error updating availability status', description: error.response.data.message });
      }
    },
    async updateCustomMessage(message, isCustomInput = false) {
      this.availability.customMessage = message; // Update custom message with the clicked message
      await availabilityService.setCustomMessage(this.userId, this.availability.customMessage);
      // If the input is not a custom input, update the availability status based on the selected message
      if (!isCustomInput) {
        this.setAvailabilityBasedOnMessage(message);
      }
    },
    async updateDisplayOption() {
      try {
        await availabilityService.setDisplayOption(this.userId, this.availability.displayToOthers);
      } catch (error) {
        this.$notification['error']({ message: 'Error updating display option', description: error.response.data.message });

      }
    },
    toggleNotification() {
      console.log('Notification for disconnection:', this.notifyDisconnection);
    },
    resetSettings() {
      // Reset to original values
      this.availability = {
        ...this.availability,
        ...this.originalSettings
      }
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
