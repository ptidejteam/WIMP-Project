<template>
    <a-card :bordered="false" class="header-solid h-full" :bodyStyle="{ paddingTop: 0, paddingBottom: '16px' }">
      <template #title>
        <h6 class="font-semibold m-0">Device Locations</h6>
      </template>
  
      <!-- Refresh Button -->
      <div class="refresh-button-container">
        <a-button type="default" @click="fetchDevices" style="background-color: ghostwhite">
          Refresh Device Data
        </a-button>
      </div>
  
      <!-- Map Container with Scroll -->
      <div class="map-container">
        <LMap :zoom="zoomLevel" :center="mapCenter" style="height: 400px; width: 100%;">
          <LTileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            :attribution="`&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors`" 
          />
          <LMarker  :lat-lng="[45.4215, -75.6972]"></LMarker>
          <LMarker v-for="device in devices" :key="device.id" :lat-lng="[device.location.latitude, device.location.longitude]">
            <LPopup class="custom-popup">
              <div>
                <h6>{{ device.deviceName }}</h6>
                <p>Status: <span :style="{ color: device.status === 'online' ? '#28a745' : '#dc3545' }">{{ device.status }}</span></p>
                <p>Latitude: {{ device.location.latitude }}</p>
                <p>Longitude: {{ device.location.longitude }}</p>
              </div>
            </LPopup>
          </LMarker>
        </LMap>
      </div>
    </a-card>
  </template>
  
  <script>
  import { LMap, LTileLayer, LMarker, LPopup } from "vue3-leaflet";
  import "leaflet/dist/leaflet.css";
  import { deviceService } from "../../services/device.service";
  
  export default {
    components: { LMap, LTileLayer, LMarker, LPopup },
    data() {
      return {
        devices: [],
        mapCenter: [45.4215, -75.6972], // Default map center coordinates
        zoomLevel: 10,
        pollingInterval: null,
      };
    },
    mounted() {
      this.fetchDevices();
      this.startPolling();
    },
    beforeUnmount() {
      this.stopPolling();
    },
    methods: {
      async fetchDevices() {
        try {
          const response = await deviceService.getAll();
          console.log(response.data);
          this.devices = response.data.map(device => ({
            id: device.id,
            deviceName: device.name,
            location: {
              latitude: device.latitude,
              longitude: device.longitude,
            },
            status: device.status,
          }));
        } catch (error) {
          this.$message.error("Failed to fetch device locations.");
          console.error(error);
          this.stopPolling();
        }
      },
      startPolling() {
        this.pollingInterval = setInterval(this.fetchDevices, 5000);
      },
      stopPolling() {
        if (this.pollingInterval) {
          clearInterval(this.pollingInterval);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .refresh-button-container {
    text-align: center;
    margin: 16px 0;
  }
  
  .map-container {
    height: 400px;
    overflow-y: hidden;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 8px;
  }
  
  /* Custom Popup Styles */
  .custom-popup {
    background-color: #f9f9f9; /* Light background */
    border: 1px solid #ddd; /* Light border */
    border-radius: 4px; /* Rounded corners */
    padding: 10px; /* Padding inside the popup */
  }
  
  .custom-popup h6 {
    margin: 0; /* Remove default margin */
    font-weight: bold; /* Make title bold */
    color: #333; /* Dark color for the title */
  }
  
  .custom-popup p {
    margin: 4px 0; /* Space between paragraphs */
    color: #555; /* Medium color for text */
  }
  </style>
  