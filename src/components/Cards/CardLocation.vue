<template>
  <a-card :bordered="true" :bodyStyle="{ padding: '16px' }">
    <template #title>
      <div class="header">
        <h6 class="font-semibold m-0">Locations Control Panel</h6>
        <div>
          <a-button @click="resetSettings" icon="redo" type="link">Refresh</a-button>
          <small style="font-style: italic;">Updated: {{ lastUpdated || "Fetching data..." }}</small>
        </div>
      </div>
    </template>

    <div class="section">
      <div style="display: flex; justify-content: space-between;">
        <h6 class="font-semibold">Enable Workspace Tracking</h6>
        <a-tooltip :title="trackingEnabled ? 'Tracking is enabled' : 'Tracking is disabled'">
          <a-switch v-model="trackingEnabled" @change="updateTrackingOption" checked-children="On"
            un-checked-children="Off">
          </a-switch>
        </a-tooltip>
      </div>
      <p class="text-muted">
        Toggle this setting to enable or disable live location tracking for the selected workspace.
      </p>
    </div>

    <a-tabs default-active-key="1">
      <a-tab-pane key="1" tab="Live Location">
        <div class="workspaces-section">
          <p class="text-muted description-text">
            Select a workspace from the list to display its current location on the map.
          </p>
        </div>
        <div class="map-controls">
          <a-button @click="resetView">Reset View</a-button>
        </div>
        <div class="map-container">
          <LMap :zoom="zoomLevel" :center="mapCenter" style="height: 300px; width: 100%;" @update:zoom="onZoomChange"
            @update:center="onCenterChange">
            <LTileLayer :url="url" :attribution="attribution" />

            <!-- Render Markers and Circles -->
            <div v-for="workspace in workspaces" :key="workspace.id">
              <LMarker :key="'marker-' + workspace.id" :lat-lng="[workspace.coordinates.lat, workspace.coordinates.lng]"
                @click="onMarkerClick(workspace)">
                <LPopup>
                  <div>
                    <h6>{{ workspace.name }}</h6>
                    <p>{{ workspace.description }}</p>
                  </div>
                </LPopup>
              </LMarker>

              <LCircle :key="'circle-' + workspace.id" :lat-lng="[workspace.coordinates.lat, workspace.coordinates.lng]"
                :radius="workspace.lookoutDiameter" :color="'blue'" :fill-opacity="0.2" />
            </div>
          </LMap>
        </div>
      </a-tab-pane>

      <a-tab-pane key="2" tab="Define Workspaces">
        <div class="define-workspaces-section" style="min-height: 300px;">
          <p class="text-muted description-text">
            Add new workspaces or modify existing ones. Here, you can define workspace coordinates and the lookout
            diameter to ensure proper coverage and management.
          </p>

          <div class="add-workspace">
            <a-row gutter={16}>
              <a-col :span="8">
                <a-input v-model="newWorkspaceName" placeholder="Enter workspace name" style="width: 100%;" />
              </a-col>
              <a-col :span="8">
                <a-input v-model="newWorkspaceCoordinates" placeholder="Enter coordinates (lat,lng)"
                  style="width: 100%;" />
              </a-col>
              <a-col :span="8">
                <a-input v-model="newLookoutDiameter" placeholder="Enter lookout diameter (meters)"
                  style="width: 100%;" />
              </a-col>
            </a-row>
            <a-button type="primary" @click="addWorkspace" style="margin-top: 16px;">Add Workspace</a-button>
          </div>

          <div class="workspace-list-container" style="max-height: 300px; overflow-y: auto; margin-top: 15px;">
            <ul class="workspace-list">
              <li v-for="workspace in workspaces" :key="workspace.id" class="workspace-item">
                <span>{{ workspace.name }} - Coordinates: ({{ workspace.coordinates.lat }}, {{ workspace.coordinates.lng
                  }})</span>
                <span> - Lookout Diameter: {{ workspace.lookoutDiameter }} meters</span>
                <a-button type="link" @click="removeWorkspace(workspace.id)">Remove</a-button>
              </li>
            </ul>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script>
import { LMap, LTileLayer, LMarker, LCircle, LPopup } from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import { deviceService } from "../../services/device.service";

export default {
  components: { LMap, LTileLayer, LMarker, LCircle , LPopup},
  data() {
    return {
      devices: [],
      mapCenter: [45.4215, -75.6972],
      zoomLevel: 10,
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: `&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors`,
      lastUpdated: null,
      selectedWorkspace: null,
      workspaces: [
        { id: 1, name: 'Workspace A', coordinates: { lat: 40.7128, lng: -74.0060 }, lookoutDiameter: 500 },
        { id: 2, name: 'Workspace B', coordinates: { lat: 34.0522, lng: -118.2437 }, lookoutDiameter: 300 },
        { id: 3, name: 'Workspace C', coordinates: { lat: 51.5074, lng: -0.1278 }, lookoutDiameter: 100 },
      ],
      newWorkspaceName: "",
      newWorkspaceCoordinates: "",
      newLookoutDiameter: "",
      trackingEnabled: false,
    };
  },
  methods: {
    centerMapOnWorkspace() {
      if (this.selectedWorkspace) {
        const { lat, lng } = this.selectedWorkspace.coordinates;
        this.mapCenter = [lat, lng];
      }
    },
    fetchDevices() {
      deviceService.getAll().then((response) => {
        this.devices = response.data;
        this.lastUpdated = new Date().toLocaleString();
      }).catch(() => {
        this.$message.error("Failed to fetch device locations.");
      });
    },
    resetSettings() {
      this.fetchDevices();
    },
    addWorkspace() {
      if (this.newWorkspaceName && this.newWorkspaceCoordinates && this.newLookoutDiameter) {
        const coords = this.newWorkspaceCoordinates.split(',').map(Number);
        const newId = this.workspaces.length + 1;
        this.workspaces.push({
          id: newId,
          name: this.newWorkspaceName,
          coordinates: { lat: coords[0], lng: coords[1] },
          lookoutDiameter: parseInt(this.newLookoutDiameter),
        });
        this.newWorkspaceName = "";
        this.newWorkspaceCoordinates = "";
        this.newLookoutDiameter = "";
      }
    },
    removeWorkspace(workspaceId) {
      this.workspaces = this.workspaces.filter(w => w.id !== workspaceId);
    },
    updateTrackingOption() {
      console.log("Tracking enabled:", this.trackingEnabled);
    },
    onZoomChange(newZoom) {
      this.zoomLevel = newZoom; // Synchronize zoom level
    },
    onCenterChange(newCenter) {
      this.mapCenter = newCenter; // Synchronize center coordinates
    },
    onMarkerClick(workspace) {
      this.$message.info(`Clicked on ${workspace.name}`);
    },
    resetView() {
      // Reset to initial view
      this.mapCenter = [this.workspaces[0].coordinates.lat, this.workspaces[0].coordinates.lng]
      this.zoomLevel = 15;
    },
    onZoomSliderChange(value) {
      // Triggered when zoom slider changes
      this.zoomLevel = value;
    },
  },
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.general-description {
  margin-bottom: 20px;
}

.tab-content {
  height: 400px;
  overflow-y: auto;
}

.map-container {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 8px;
}

.define-workspaces-section .workspace-list {
  min-height: 193px;
  max-height: 300px;
  list-style: none;
  padding: 0;
}

.workspace-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.description-text {
  font-size: 14px;
  color: #555;
}

.section {
  padding: 16px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}
</style>
