<template>
  <a-modal :visible="visible" title="Define Workspaces" :footer="null" @cancel="closeModal">
    <div class="modal-description">
      <p class="text-semibold">
        Please provide details for the new workspace. Enter a name, search for a location, and define geographical coordinates (latitude and longitude) along with the lookout diameter.
      </p>
    </div>

    <a-form :form="form" layout="vertical">
      <!-- Location Search -->
      <a-form-item label="Search Location">
        <a-input v-model="searchQuery" placeholder="Enter location" @input="debouncedSearch" suffix-icon="search" allow-clear />
      </a-form-item>

      <div v-if="isSearching" class="loading-indicator">
        <a-spin size="small" />
      </div>

      <div v-if="searchResults.length" class="scrollable-list">
        <a-list bordered>
          <a-list-item v-for="item in searchResults" :key="item.place_id" @click="selectLocation(item)" style="cursor: pointer;">
            {{ item.display_name }}
          </a-list-item>
        </a-list>
      </div>

      <a-divider />

      <!-- Form Fields -->
      <a-form-item label="Workspace Name" :has-feedback="true">
        <a-input v-decorator="['workspaceName', { rules: [{ required: true, message: 'Please enter a workspace name' }] }]" placeholder="Enter workspace name" />
      </a-form-item>

      <a-form-item label="Lookout Diameter (meters)">
        <a-input-number v-decorator="['lookoutDiameter', { rules: [{ required: true, message: 'Please enter a lookout diameter' }] }]" placeholder="Enter lookout diameter" style="width: 100%;" />
      </a-form-item>

      <a-form-item>
        <a-checkbox v-model="manualInput" @change="toggleManualInput">Manually enter latitude and longitude</a-checkbox>
      </a-form-item>

      <a-form-item label="Latitude" v-if="manualInput">
        <a-input v-decorator="['latitude', { rules: [{ required: true, message: 'Please enter a valid latitude' }] }]" placeholder="Enter latitude" />
      </a-form-item>

      <a-form-item label="Longitude" v-if="manualInput">
        <a-input v-decorator="['longitude', { rules: [{ required: true, message: 'Please enter a valid longitude' }] }]" placeholder="Enter longitude" />
      </a-form-item>

      <div class="form-footer">
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
      isSearching: false,
      searchResults: [],
      selectedLocation: { lat: null, lon: null },
      manualInput: false,
    };
  },
  methods: {
    closeModal() {
      this.form.resetFields();
      this.searchQuery = '';
      this.searchResults = [];
      this.selectedLocation = { lat: null, lon: null };
      this.manualInput = false;
      this.$emit("close");
    },
    debouncedSearch: debounce(function () {
      this.performSearch();
    }, 500),
    async performSearch() {
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        return;
      }
      this.isSearching = true;
      try {
        const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { q: this.searchQuery, format: 'json' },
        });
        this.searchResults = data || [];
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        this.isSearching = false;
      }
    },
    selectLocation(item) {
      this.selectedLocation = { lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
      this.form.setFieldsValue({
        latitude: this.selectedLocation.lat,
        longitude: this.selectedLocation.lon,
        workspaceName: item.display_name,
      });
      this.searchQuery = item.display_name;
      this.searchResults = [];
    },
    toggleManualInput() {
      if (!this.manualInput) {
        this.selectedLocation = { lat: null, lon: null };
      }
    },
    async handleSubmit() {
      try {
        const values = await this.form.validateFields();
        const newWorkspace = {
          id: this.workspaces.length + 1,
          name: values.workspaceName,
          coordinates: { lat: this.selectedLocation.lat, lng: this.selectedLocation.lon },
          lookoutDiameter: values.lookoutDiameter,
        };
        this.workspaces.push(newWorkspace);
        await userService.putUser(this.userId, { workSpaces: this.workspaces });
        this.$emit("add-workspace", newWorkspace);
        this.closeModal();
      } catch (error) {
        console.error('Form validation failed:', error);
      }
    },
  },
};
</script>

<style scoped>
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

.form-footer {
  text-align: right;
  margin-top: 12px;
}
</style>
