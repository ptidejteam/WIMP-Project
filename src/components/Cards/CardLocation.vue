<template>
  <a-card :bordered="true" :bodyStyle="{ padding: '16px' }">
    <template #title>
      <div class="header">
        <div style="display: flex;flex-direction: column;">
          <h6 class="font-semibold m-0">Locations Control Panel</h6>
          <small style="font-style: italic;">Updated: {{ lastUpdated || "Fetching data..." }}</small>

        </div>
        <div>
          <a-button icon="redo" type="link">Refresh</a-button>
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
    <template v-if="!workSpaces">
      <a-skeleton />
    </template>
    <template v-else>
      <div class="workSpaces-section">
        <p class="text-muted description-text">
          Select a workspace from the list to display its current location on the map.
        </p>
      </div>
      <div style="display: flex;">
        <a-select v-model="selectedWorkspace" placeholder="Select a workspace" style="width: 100%;"
          @change="onWorkspaceSelection">
          <a-select-option v-for="workspace in workSpaces" :key="workspace.id" :value="workspace.id">
            {{ workspace.name }} - Coordinates: ({{ workspace.coordinates.lat }}, {{ workspace.coordinates.lng }}) -
            Lookout Diameter: {{ workspace.lookoutDiameter }} meters
          </a-select-option>
        </a-select>
        <a-button icon="plus" @click="visible = true"></a-button>
        <WorkspaceFormModal :visible="visible" @close="visible = false" :workspaces="workSpaces" @add-workspace="fetchUserData">
        </WorkspaceFormModal>

      </div>

      <div class="map-container">
        <LMap :zoom="mapOptions.zoomLevel" :center="mapOptions.mapCenter" style="height: 300px; width: 100%;"
          @update:zoom="onZoomChange" @update:center="onCenterChange">
          <LTileLayer :url="mapOptions.url" :attribution="mapOptions.attribution" />

          <!-- Render Markers and Circles -->
          <div v-for="workspace in workSpaces" :key="workspace.id">
            <LMarker :key="'marker-' + workspace.id" :lat-lng="[workspace.coordinates.lat, workspace.coordinates.lng]">
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
    </template>
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
      newWorkspaceName: "",
      newWorkspaceCoordinates: "",
      newLookoutDiameter: "",
      trackingEnabled: false,
      selectedWorkspaceId: "",
      visible: false,
      mapOptions: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: `&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors`,
        zoomLevel: 15,
        mapCenter: [45.4215, -75.6972]
      }
    };
  },
  async mounted() {

    this.fetchUserData();
  },



  methods: {
    async fetchUserData() {
      const response = await userService.getById(this.userId);
      this.workSpaces = response.data?.workSpaces;
      this.selectedWorkspace = this.workSpaces[0].id;
      this.onCenterChange(this.workSpaces[0].coordinates);
    },
    onWorkspaceSelection(value) {
      // Get the selected workspace 
      const selected = this.workSpaces.find(o => o.id === value);
      this.onCenterChange(selected.coordinates);
    },
    fetchDevices() {
      deviceService.getAll().then((response) => {
        this.devices = response.data;
        this.lastUpdated = new Date().toLocaleString();
      }).catch(() => {
        this.$message.error("Failed to fetch device locations.");
      });
    },

    updateTrackingOption() {
      console.log("Tracking enabled:", this.trackingEnabled);
    },
    onZoomChange(newZoom) {
      this.zoomLevel = newZoom; // Synchronize zoom level
    },
    onCenterChange(newCenter) {
      this.mapOptions.mapCenter = newCenter; // Synchronize center coordinates
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

.define-workSpaces-section .workspace-list {
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
