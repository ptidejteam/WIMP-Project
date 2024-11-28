<template>
  <a-card :bordered="true" :bodyStyle="{ padding: '16px' }">
    <template #title>
      <div class="header">
        <div class="header-info">
          <h6 class="font-semibold m-0">Locations Control Panel</h6>
          <small class="italic-text">Updated: {{ lastUpdated | dateTime }}</small>
        </div>
        <a-button icon="redo" type="link" @click="fetchUserData">Refresh</a-button>
      </div>
    </template>

    <div class="section" v-if="workSpaces.length !== 0">
      <div class="toggle-section">
        <h6 class="font-semibold">Enable Workspace Tracking</h6>
        <a-tooltip :title="trackingEnabled ? 'Tracking is enabled' : 'Tracking is disabled'">
          <a-switch v-model="trackingEnabled" @change="debounce(updateTrackingOption, 300)" checked-children="On"
            un-checked-children="Off" />
        </a-tooltip>
      </div>
      <p class="text-muted">Toggle this setting to enable or disable live location tracking for the selected workspace.
      </p>
    </div>

    <template v-if="!workSpaces">
      <a-skeleton />
    </template>
    <template v-else-if="workSpaces.length === 0">
      <div class="no-workspaces-container">
        <p class="no-workspaces-text">
          🚀 No workspaces available yet! Start by adding a workspace to enable location tracking.
        </p>
        <a-button type="primary" icon="plus" @click="visible = true" class="add-workspace-button">
          Add Workspace
        </a-button>
      </div>
    </template>
    <template v-else>
      <div class="workSpaces-section">
        <p class="description-text">Select a workspace from the list to display its current location on the map.</p>
      </div>
      <div class="workspace-controls">
        <a-select v-model="selectedWorkspace" placeholder="Select a workspace" style="width: 90%;"
          @change="onWorkspaceSelection">
          <a-select-option v-for="workspace in workSpaces" :key="workspace.id" :value="workspace.id">
            {{ workspace.name }}
          </a-select-option>
        </a-select>
        <a-button icon="plus" @click="visible = true" />

      </div>
      <div class="map-container">
        <LMap :zoom="mapOptions.zoomLevel" :center="mapOptions.mapCenter" style="height: 300px; width: 100%;"
          @update:zoom="onZoomChange" @update:center="onCenterChange">
          <LTileLayer :url="mapOptions.url" :attribution="mapOptions.attribution" />
          <LMarker v-for="workspace in workSpaces" :key="'marker-' + workspace.id"
            :lat-lng="[workspace.coordinates.lat, workspace.coordinates.lng]">
            <LPopup>
              <h6>{{ workspace.name }}</h6>
              <p>{{ workspace.description }}</p>
            </LPopup>
          </LMarker>
          <LCircle v-for="workspace in workSpaces" :key="'circle-' + workspace.id"
            :lat-lng="[workspace.coordinates.lat, workspace.coordinates.lng]" :radius="workspace.lookoutDiameter"
            color="blue" :fill-opacity="0.2" />
        </LMap>
      </div>
    </template>
    <WorkspaceFormModal :visible="visible" @close="visible = false" :workspaces="workSpaces"
      @add-workspace="fetchUserData" />
  </a-card>
</template>

<script>
import { LMap, LTileLayer, LMarker, LCircle, LPopup } from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import { deviceService } from "../../services/device.service";
import { AuthenticationService } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import WorkspaceFormModal from "../Modals/WorkspaceFormModal.vue";

export default {
  components: { LMap, LTileLayer, LMarker, LCircle, LPopup, WorkspaceFormModal },
  data() {
    return {
      userId: AuthenticationService.currentUserValue.userId,
      devices: [],
      lastUpdated: null,
      selectedWorkspace: null,
      workSpaces: null,
      enableTracking : false,
      trackingEnabled: false,
      visible: false,
      mapOptions: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
        zoomLevel: 15,
        mapCenter: [45.4215, -75.6972],
      },
    };
  },
  async mounted() {
    await this.fetchUserData();
  },
  methods: {
    async fetchUserData() {
      try {
        const response = await userService.getById(this.userId);
        this.workSpaces = response.data?.workSpaces || [];
        this.selectedWorkspace = this.workSpaces[0]?.id || null;
        this.enableTracking = response.data?.preferences?.enableTracking || false;
        if (this.selectedWorkspace) this.onCenterChange(this.workSpaces[0].coordinates);
        this.lastUpdated = Date.now();
      } catch (error) {
        this.$message.error("Failed to fetch workspace data.");
      }
    },
    onWorkspaceSelection(value) {
      const selected = this.workSpaces.find(o => o.id === value);
      if (selected) this.onCenterChange(selected.coordinates);
    },
    debounce(func, delay) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(func, delay);
    },
    updateTrackingOption() {
      console.log("Tracking enabled:", this.trackingEnabled);
    },
    onZoomChange(newZoom) {
      this.mapOptions.zoomLevel = newZoom;
    },
    onCenterChange(newCenter) {
      this.mapOptions.mapCenter = newCenter;
    },
  },
  filters: {
    dateTime(value) {
      return !value ? "" : new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.italic-text {
  font-style: italic;
}

.section {
  padding: 16px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.toggle-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.workspace-controls {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
}

.map-container {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 8px;
}

.description-text {
  font-size: 14px;
  color: #555;
}

.no-workspaces-text {
  color: #555;
  font-style: italic;
}

.no-workspaces-container {
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
}

.no-workspaces-text {
  color: #595959;
  margin-bottom: 16px;
  font-weight: 500;
}

.add-workspace-button {
  font-weight: 600;
}
</style>
