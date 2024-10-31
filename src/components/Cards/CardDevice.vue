<template>
    <a-card :bordered="true" class="header-solid h-full mb-24" :bodyStyle="{ paddingTop: '14px' }">
        <template #title>
            <h6 class="font-semibold">Devices</h6>
            <p>Overview of all devices</p>
        </template>
        <a-row type="flex" :gutter="[24, 24]" align="stretch">
            <!-- Check if there are no devices -->
            <template v-if="filteredDevices.length === 0">
                <a-col :span="24">
                    <a-empty description="No devices found. Please add a new device." />
                    <a-button type="primary" @click="openAddDeviceDialog" style="margin-top: 16px">Add Device</a-button>
                </a-col>
            </template>
            <!-- Device Column -->
            <a-col :span="24" :md="12" :xl="6" v-for="(device) in filteredDevices" :key="device.id">
                <a-card :hoverable="true" :bordered="true" class="device-card">
                    <div class="device-icon">
                        <!-- <img :src="device.icon" alt="Device Icon" class="icon" /> -->
                    </div>
                    <a-card-meta :title="device.name"
                        :description="`Status: ${device.status} | Type: ${device.deviceType}`" />
                    <div class="end">
                        <div>
                            <a-button type="primary" @click="viewDetails(device.id)">View Details</a-button>
                            <a-button type="default" @click="editDevice(device)" style="margin-left: 8px">Edit</a-button>
                        </div>
                        <div class="device-user">
                            <img v-if="device.user.avatar" :src="device.user.avatar" alt="User Avatar"
                                class="user-avatar" />
                            <span v-if="device.user.name">{{ device.user.name }}</span>
                        </div>
                    </div>
                </a-card>
            </a-col>
        </a-row>

        <!-- Modal for Editing Device -->
        <a-modal :visible="isEditing" title="Edit Device" @ok="saveDevice" @cancel="cancelEdit">
            <a-form :model="selectedDevice">
                <a-form-item label="Device Name">
                    <a-input v-model="selectedDevice.name" />
                </a-form-item>
                <a-form-item label="Status">
                    <a-input v-model="selectedDevice.status" />
                </a-form-item>
                <a-form-item label="Type">
                    <a-input v-model="selectedDevice.deviceType" />
                </a-form-item>
                <a-form-item label="Location">
                    <a-input v-model="selectedDevice.location" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- Modal for Adding Device -->
        <a-modal :visible="isAdding" title="Add Device" @ok="addDevice" @cancel="cancelAdd">
            <a-form :model="newDevice">
                <a-form-item label="Device Name">
                    <a-input v-model="newDevice.name" />
                </a-form-item>
                <a-form-item label="Status">
                    <a-input v-model="newDevice.status" />
                </a-form-item>
                <a-form-item label="Type">
                    <a-input v-model="newDevice.deviceType" />
                </a-form-item>
                <a-form-item label="Location">
                    <a-input v-model="newDevice.location" />
                </a-form-item>
                <a-form-item label="Fitbit Information">
                    <a-input v-model="newDevice.fitbitInfo" placeholder="Enter Fitbit Information" />
                </a-form-item>
            </a-form>
        </a-modal>
    </a-card>
</template>

<script>
import { deviceService } from '../../services/device.service'; // Adjust the import path as necessary
import { userService } from '../../services/user.service'; // Adjust the import path as necessary
import { AuthenticationService } from '../../services/auth.service';
import { Role } from "../../helpers/roles";

export default {
    data() {
        return {
            devices: [],
            isEditing: false,
            isAdding: false, // Flag to show/hide the add device modal
            selectedDevice: {},
            newDevice: { // Object to hold new device details
                name: '',
                status: '',
                deviceType: '',
                location: '',
                fitbitInfo: '' // Field for Fitbit information
            },
            userRole: null
        };
    },
    computed: {
        filteredDevices() {
            return this.userRole === Role.Member 
                ? this.devices.filter(device => device.userId === AuthenticationService.currentUserValue["userId"]) 
                : this.devices;
        },
    },
    created() {
        this.fetchDevices();
    },
    methods: {
        async fetchDevices() {
            try {
                const response = await deviceService.getAll();
                const devices = response.data;

                const userPromises = devices.map(device => userService.getById(device.userId));
                const users = await Promise.all(userPromises);

                this.devices = devices.map((device, index) => ({
                    ...device,
                    user: users[index].data
                }));

                const currentUser = await userService.getById(AuthenticationService.currentUserValue["userId"]);
                this.userRole = currentUser.data.permissionLevel;

            } catch (error) {
                console.error('Error fetching devices:', error);
            }
        },
        viewDetails(deviceId) {
            console.log(`Viewing details for device ID: ${deviceId}`);
        },
        editDevice(device) {
            this.selectedDevice = { ...device };
            this.isEditing = true;
        },
        async saveDevice() {
            try {
                await deviceService.update(this.selectedDevice.id, this.selectedDevice);
                const index = this.devices.findIndex(d => d.id === this.selectedDevice.id);
                if (index !== -1) {
                    this.devices[index] = this.selectedDevice;
                }
                this.isEditing = false;
            } catch (error) {
                console.error('Error saving device:', error);
            }
        },
        cancelEdit() {
            this.isEditing = false;
        },
        openAddDeviceDialog() {
            this.newDevice = { // Reset new device data
                name: '',
                status: '',
                deviceType: '',
                location: '',
                fitbitInfo: ''
            };
            this.isAdding = true; // Show the add device modal
        },
        async addDevice() {
            try {
                // Call the device service to add the new device
                const response = await deviceService.create(this.newDevice); // Adjust to your API
                this.devices.push(response.data); // Add the new device to the list
                this.isAdding = false; // Hide the modal
            } catch (error) {
                console.error('Error adding device:', error);
            }
        },
        cancelAdd() {
            this.isAdding = false; // Hide the modal without saving
        },
    },
};
</script>

<style scoped>
.device-card {
    width: 100%;
    margin-bottom: 16px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 16px;
}

.device-icon {
    text-align: center;
    margin-bottom: 8px;
}

.icon {
    width: 40px;
    height: 40px;
}

.device-user {
    display: flex;
    align-items: center;
    margin-top: 8px;
    justify-content: flex-end;
}
.end { 
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;    
}
.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 8px;
}
</style>
