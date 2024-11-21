<template>
  <a-card :bordered="true" :bodyStyle="{ padding: '16px' }">
    <template #title>
      <div class="header">
        <h6 class="font-semibold m-0">Device Locations</h6>
        <!-- Last Updated -->
        <div>
          <a-button @click="resetSettings" icon="redo" type="link">Refresh</a-button>
          <small style="font-style: italic;">Updated: {{ lastUpdated || "Fetching data..." }}</small>
        </div>
      </div>
    </template>

    <!-- Workspaces Section -->
    <div class="workspaces-section">
      <h6 class="font-semibold">Workspaces</h6>
      <p class="text-muted description-text">
        Select workspaces to display their locations on the map.
      </p>

      <!-- Workspaces List with Checkbox -->
      <div class="workspace-list mt-15">
        <!-- Dropdown for selecting workspace -->
        <a-select v-model="selectedWorkspace" style="width: 200px" @change="centerMapOnWorkspace"
          placeholder="Select Workspace">
          <a-select-option v-for="workspace in workspaces" :key="workspace.id" :value="workspace">
            {{ workspace.name }}
          </a-select-option>
        </a-select>
      </div>
    </div>

    <!-- Map Container -->
    <div class="map-container">
      <LMap :zoom="zoomLevel" :center="mapCenter" style="height: 100%; width: 100%;">
        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          :attribution="`&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors`" />
        <LMarker v-for="workspace in workspaces" :key="workspace.id"
          :lat-lng="[workspace.coordinates.lat, workspace.coordinates.lng]">
        </LMarker>
      </LMap>
    </div>
  </a-card>
</template>

<script>
import { LMap, LTileLayer, LMarker } from "vue3-leaflet";
import "leaflet/dist/leaflet.css";
import { deviceService } from "../../services/device.service";

export default {
  components: { LMap, LTileLayer, LMarker },
  data() {
    return {
      devices: [],
      mapCenter: [45.4215, -75.6972], // Default map center
      zoomLevel: 10,
      lastUpdated: null,
      selectedWorkspace: [], // The selected workspace
      workspaces: [
        { id: 1, name: 'Workspace A', coordinates: { lat: 40.7128, lng: -74.0060 } },
        { id: 2, name: 'Workspace B', coordinates: { lat: 34.0522, lng: -118.2437 } },
        { id: 3, name: 'Workspace C', coordinates: { lat: 51.5074, lng: -0.1278 } },
        // Add more workspaces as needed
      ],
      newWorkspaceName: "",
      showAddWorkspaceInput: false,
    };
  },
  methods: {
    // Method to handle map centering based on selected workspace
    centerMapOnWorkspace() {
      if (this.selectedWorkspace) {
        const { lat, lng } = this.selectedWorkspace.coordinates;

        // Assuming you are using a map library like Google Maps
        // Example: Centering the map to selected workspace's coordinates
        this.centerMap(lat, lng);
      }
    },

    // This method would actually interact with your map library
    centerMap(lat, lng) {
      // Replace this with actual map code (e.g., using Google Maps API)
      console.log(`Centering map to lat: ${lat}, lng: ${lng}`);
      this.mapCenter = [lat,lng];
      // Example for Google Maps:
      // map.setCenter({ lat, lng });
    },


    async fetchDevices() {
      try {
        const response = await deviceService.getAll();
        this.devices = response.data.map((device) => ({
          id: device.id,
          deviceName: device.name,
          location: {
            latitude: device.latitude,
            longitude: device.longitude,
          },
          status: device.status,
        }));
        this.lastUpdated = new Date().toLocaleString();
      } catch (error) {
        this.$message.error("Failed to fetch device locations.");
      }
    },
    resetSettings() {
      this.fetchDevices(); // Refresh devices data if necessary
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

.map-container {
  height: 400px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 8px;
}

.workspace-checkbox {
  margin-right: 10px;
}

.custom-popup h6 {
  font-weight: bold;
  color: #333;
}
</style>
