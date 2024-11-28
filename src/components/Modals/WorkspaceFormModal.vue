<template>
  <a-modal :visible="visible" title="Define Workspaces" :footer="null" @cancel="closeModal">
    <div class="modal-description">
      <p class="text-semibold">
        Please provide the details for the new workspace. You can enter a name for the workspace, search for a location,
        and define the geographical coordinates (latitude and longitude) along with the lookout diameter for the
        workspace area.
      </p>
    </div>

    <a-form :form="form" layout="vertical">
      <!-- Geosearch Input -->
      <a-form-item label="Search Location">
        <a-input v-model="searchQuery" placeholder="Enter location name" @input="debounceSearch" suffix-icon="search"
          allow-clear />
      </a-form-item>

      <!-- Loading indicator for search -->
      <div v-if="searchQuery != '' && !searchResults.length" class="loading-indicator">
        <a-spin size="small" />
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length" class="scrollable-list">
        <a-list bordered>
          <a-list-item v-for="item in searchResults" :key="item.place_id" @click="selectLocation(item)"
            style="cursor: pointer;">
            {{ item.display_name }}
          </a-list-item>
        </a-list>
      </div>
      <a-divider></a-divider>

      <!-- Workspace Name Input -->
      <a-form-item label="Workspace Name" :hasFeedback="true">
        <a-input
          v-decorator="['workspaceName', { rules: [{ required: true, message: 'Please enter a workspace name' }] }]"
          placeholder="Enter workspace name" />
      </a-form-item>

      <!-- Lookout Diameter Input -->
      <a-form-item label="Lookout Diameter (meters)">
        <a-input-number
          v-decorator="['lookoutDiameter', { rules: [{ required: true, message: 'Please enter a lookout diameter' }] }]"
          placeholder="Enter lookout diameter" style="width: 100%;" />
      </a-form-item>

      <!-- Checkbox for manual input toggle -->
      <a-form-item>
        <a-checkbox v-model="manualInput" @change="toggleManualInput">
          Manually enter latitude and longitude
        </a-checkbox>
      </a-form-item>

      <!-- Latitude Input -->
      <a-form-item label="Latitude" v-if="manualInput">
        <a-input
          v-decorator="['latitude', { rules: [{ required: true, message: 'Please enter a valid latitude' }] }]"
          placeholder="Enter latitude" />
      </a-form-item>

      <!-- Longitude Input -->
      <a-form-item label="Longitude" v-if="manualInput">
        <a-input
          v-decorator="['longitude', { rules: [{ required: true, message: 'Please enter a valid longitude' }] }]"
          placeholder="Enter longitude" />
      </a-form-item>

      <!-- Add Workspace Button -->
      <div style="text-align: right; margin-top: 12px;">
        <a-button type="primary" @click="handleSubmit">Add Workspace</a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script>
import axios from 'axios';
import { debounce } from 'lodash';
import { AuthenticationService } from "../../services/auth.service";
import { userService } from '../../services/user.service';

export default {
  props: {
    visible: Boolean,
    workspaces: Array,
  },
  data() {
    return {
      userId: AuthenticationService.currentUserValue.userId,
      form: this.$form.createForm(this),
      searchQuery: '',
      loading: false,
      searchResults: [],
      selectedLocation: {
        lat: null,
        lon: null,
      },
      manualInput: false, // Toggle for manual input
    };
  },
  methods: {
    closeModal() {
      this.form.resetFields();  // Reset the form fields
      this.searchQuery = '';
      this.searchResults = [];
      this.selectedLocation = { lat: null, lon: null };
      this.manualInput = false; // Reset the manual input checkbox
      this.$emit("close");
    },
    debounceSearch: debounce(function () {
      this.performSearch();
    }, 500),
    async performSearch() {
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        return;
      }

      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: this.searchQuery,
            format: 'json',
          },
        });
        this.searchResults = response.data.length ? response.data : [];
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    },
    selectLocation(item) {
      this.selectedLocation = {
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      };

      // Update form fields with selected location
      this.form.setFieldsValue({
        latitude: this.selectedLocation.lat,
        longitude: this.selectedLocation.lon,
        workspaceName: item.display_name,
      });

      // Clear search query and results
      this.searchQuery = item.display_name;
      this.searchResults = [];
    },
    toggleManualInput() {
      if (!this.manualInput) {
        this.selectedLocation = { lat: null, lon: null }; // Clear coordinates if toggled off
      }
    },
    handleSubmit() {
      this.form.validateFields(async (errors, values) => {
        if (!errors) {
          const newWorkspace = {
            name: values.workspaceName,
            coordinates: {
              lat: values.latitude,
              lng: values.longitude,
            },
            lookoutDiameter: values.lookoutDiameter,
          };

          // If manual input was used, update coordinates directly from the input fields
          if (this.manualInput) {
            newWorkspace.coordinates = {
              lat: values.latitude,
              lng: values.longitude,
            };
          }

          console.log(newWorkspace);  // Log workspace for debugging
          this.workspaces.push(newWorkspace);
          const response = await userService.putUser(this.userId, { workSpaces: this.workspaces });
          this.$emit("add-workspace", newWorkspace);
          this.closeModal();  // Close modal after successful submission
        }
      });
    },
  },
};
</script>

<style scoped>
.define-workspaces-section {
  min-height: 300px;
}

.scrollable-list {
  max-height: 100px;
  overflow-y: auto;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.modal-description {
  margin-bottom: 16px;
  font-size: 14px;
  color: #555;
}

.loading-indicator {
  display: flex;
  justify-content: center;
}
</style>
