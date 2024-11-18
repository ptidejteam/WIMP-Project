<template>
  <!-- Connectivity Availability Card -->
  <a-card :bordered="false" class="header-solid h-full" :bodyStyle="{ paddingTop: 0, paddingBottom: 0 }">
    <template #title>
      <div class="header-group">
        <h6 class="font-semibold m-0">Availability Control Panel</h6>
        <a-button @click="resetSettings" icon="redo" type="link">Reset</a-button>
      </div>
      <a-divider />

    </template>
    <template v-if="!availability">
      <a-skeleton />
    </template>

    <ul v-else class="settings-list">
      <li>
        <p class="instruction-text">Manage and display your network connection status and availability
          settings for others to view. Set your current availability, add custom messages, and control message
          visibility
        </p>
      </li>
      <li>
        <h6 class="text-sm text-muted m-0">AVAILABILITY STATUS</h6>
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
          <a-input v-model="availability.customMessage" placeholder="Enter your custom message" />
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
          <a-tag v-for="(message, index) in availability.defaultMessages" :key="index" :color="getColor(message.status)"
            class="clickable-tag" @click="updateCustomMessage(message)" :closable="userRole === Role.Master"
            @close="userRole === Role.Master ? handleClose(message.text) : null">
            {{ message.text }}
          </a-tag>

          <p v-if="inputVisible && userRole === Role.Master" class="instruction-text">
            Customize your availability message and select the status. Press Enter or click Save to confirm.
          </p>
          <div v-if="inputVisible && userRole === Role.Master" class="input-container"
            style="display: flex; gap: 8px; align-items: center;">
            <a-input ref="input" type="text" size="small" v-model="inputValue.text" @change="handleInputChange"
              @keyup.enter="handleInputConfirm" placeholder="Press Enter ⏎ to save your custom message"
              style="flex: 1;" />

            <a-select v-model="inputValue.status" placeholder="Select availability status" style="min-width: 150px;">
              <a-select-option value="available">Available</a-select-option>
              <a-select-option value="away">Away</a-select-option>
              <a-select-option value="do-not-disturb">Do Not Disturb</a-select-option>
              <a-select-option value="offline">Offline</a-select-option>
            </a-select>
            <a-button-group>

            <a-button link icon="save" @click="handleInputConfirm" style="padding: 0 8px;">
            </a-button>
            <a-button type="danger" icon="close" @click="inputVisible = false" style="padding: 0 8px;">
            </a-button>
          </a-button-group>

          </div>



          <a-tag v-else-if="userRole === Role.Master" style="background: #fff; border-style: dashed;"
            @click="showInput">
            <a-icon type="plus" /> New default message
          </a-tag>
        </div>



      </li>

      <li>
        <h6 class="list-header text-sm text-muted m-0">DISPLAY MESSAGE TO OTHERS</h6>
      </li>
      <li class="display-option-item">
        <a-tooltip
          :title="availability.displayToOthers ? 'Message is visible to others' : 'Message is hidden from others'">
          <span class="display-option-label">Show message : </span>

          <a-switch v-model="availability.displayToOthers" @change="updateDisplayOption" checked-children="Enabled"
            un-checked-children="Disabled">
            <a-icon slot="checkedChildren" type="check" />
            <a-icon slot="unCheckedChildren" type="close" />
          </a-switch>
        </a-tooltip>
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
      inputValue: { text: '', status: 'available' },
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
      this.inputValue.text = e.target.value;
    },

    async handleClose(removedTag) {
      const defaultMessages = this.availability.defaultMessages.filter(tag => tag.text !== removedTag);
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
        } catch (error) {
          this.$notification['error']({ message: 'Error updating default messages', description: error.response.data.message });

        }
      }
      this.inputVisible = false;
    },
    async updateAvailabilityStatus() {
      try {
        await availabilityService.setAvailabilityStatus(this.userId, this.availability.availabilityStatus);
        //await availabilityService.updateAvailability(this.availability);

      } catch (error) {
        this.$notification['error']({ message: 'Error updating availability status', description: error.response.data.message });
      }
    },
    async updateCustomMessage(message) {
      this.availability.customMessage = message.text; // Update custom message with the clicked message
      await availabilityService.setCustomMessage(this.userId, this.availability.customMessage);
      this.availability.availabilityStatus = message.status;
      this.updateAvailabilityStatus(); // Call method to update availability status
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
    getColor(status) {
      switch (status) {
        case "available":
          return "#27ae6066";
        case "away":
          return "#e67e2266";
        case "do-not-disturb":
          return "#e74c3c66";
        case "offline":
          return "gray";
        default:
          return "blue";
      }
    },


  },
};
</script>

<style scoped>
.settings-list {
  padding: 0;
}


.header-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 5px;
}

.clickable-tag {
  margin: 1%;
  cursor: pointer;
  font-size: inherit;
}

.message-group {
  display: flex;
}

.settings-list>li span {
  margin-left: 0;
}

.display-option-item {
  display: flex;
  align-items: center;
  /* Space between the switch and the label */
}

.display-option-label {
  font-size: 14px;
  color: #595959;
  /* Subtle color for the label */
}
</style>
