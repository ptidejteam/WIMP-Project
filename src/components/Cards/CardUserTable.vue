<template>
    <!-- Users Table Card -->
    <a-card :bordered="false" class="header-solid h-full" :bodyStyle="{ padding: 0 }">
        <template #title>
            <a-row type="flex" align="middle">
                <a-col :span="24" :md="12">
                    <h6>Users</h6>
                    <p>List of all users except yourself</p>
                </a-col>
                <a-col :span="24" :md="12" style="display: flex; align-items: center; justify-content: flex-end">
                    <a-button type="success" shape="circle" icon="plus" @click="showAddUserDialog = true"></a-button>
                </a-col>
            </a-row>
        </template>

        <a-table :columns="columns" :data-source="filteredUsers" :pagination="false" :rowKey="record => record._id">
            <template slot="userDetails" slot-scope="record">
                <div class="table-avatar-info">
                    <a-avatar shape="circle" :src="record.avatar" />
                    <div class="avatar-info">
                        <h6>{{ record.userName }}</h6>
                        <p>{{ record.email }}</p>
                    </div>
                </div>
            </template>

            <template slot="position" slot-scope="record">
                <div class="author-info">
                    <h6 class="m-0">{{ record.position }}</h6>
                </div>
            </template>

            <template slot="status" slot-scope="record">
                <a-tag class="tag-status" :class="record.isActive ? 'ant-tag-primary' : 'ant-tag-muted'">
                    {{ record.isActive ? "Active" : "Inactive" }}
                </a-tag>
            </template>

            <template slot="emailStatus" slot-scope="record">
                <a-tag class="tag-status" :class="record.emailStatus === 'verified' ? 'ant-tag-success' : 'ant-tag-warning'">
                    {{ record.emailStatus }}
                </a-tag>
            </template>

            <template slot="actions" slot-scope="record">
                <a-space>
                    <a-button type="danger" shape="circle" icon="delete" @click="deleteUser(record._id)"></a-button>
                </a-space>
            </template>
        </a-table>

        <a-modal title="Add New User" :visible="showAddUserDialog" @ok="createUser" @cancel="showAddUserDialog = false">
            <a-form layout="vertical">
                <a-row gutter="16">
                    <a-col :span="12">
                        <a-form-item label="First Name" :rules="[{ required: true, message: 'Please enter the first name' }]">
                            <a-input v-model="newUser.firstName" placeholder="Enter first name" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="Last Name" :rules="[{ required: true, message: 'Please enter the last name' }]">
                            <a-input v-model="newUser.lastName" placeholder="Enter last name" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row gutter="16">
                    <a-col :span="12">
                        <a-form-item label="Birthday">
                            <a-date-picker v-model="newUser.birthday" style="width: 100%;" placeholder="Select birthday" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="Username" :rules="[{ required: true, message: 'Please enter a unique username' }]">
                            <a-input v-model="newUser.userName" placeholder="Enter username" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row gutter="16">
                    <a-col :span="12">
                        <a-form-item label="Email">
                            <a-input v-model="newUser.email" placeholder="Enter email" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="Password" :rules="[{ required: true, message: 'Please enter a password' }]">
                            <a-input-password v-model="newUser.password" placeholder="Enter password" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row gutter="16">
                    <a-col :span="12">
                        <a-form-item label="Position">
                            <a-select v-model="newUser.position" placeholder="Select position" @change="handlePositionChange">
                                <a-select-option value="Student">Student</a-select-option>
                                <a-select-option value="Teacher">Teacher</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </a-modal>
    </a-card>
</template>

<script>
import { AuthenticationService } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import { Role } from "../../helpers/roles";

export default {
    data() {
        return {
            currentUserId: null,
            users: [],
            filteredUsers: [],
            editingUserId: null,
            pollingInterval: 10000, // Polling interval in milliseconds (10 seconds)
            pollingTimer: null, // Timer to manage polling
            columns: [
                {
                    title: 'Username',
                    key: 'userDetails',
                    scopedSlots: { customRender: 'userDetails' },
                },
                {
                    title: 'Position',
                    key: 'position',
                    scopedSlots: { customRender: 'position' },
                },
                {
                    title: 'Status',
                    key: 'status',
                    scopedSlots: { customRender: 'status' },
                },
                {
                    title: 'Actions',
                    key: 'actions',
                    scopedSlots: { customRender: 'actions' },
                }
            ],  

            showAddUserDialog: false,
            newUser: {
                firstName: '',
                lastName: '',
                birthday: null,
                userName: '',
                email: '',
                password: '',
                position: 'Student',
                permissionLevel: 1,
                avatar: 'images/face-1.jpg',
                isActive: true,
                emailStatus: 'pending',
            },
        };
    },
    async created() {
        await this.loadUsers();
        this.startPolling(); // Start polling when component is created
    },
    beforeDestroy() {
        this.stopPolling(); // Clean up polling on component destroy
    },
    methods: {
        async loadUsers() {
            try {
                const users = await userService.getAll();
                this.users = users.data;
                const userId = AuthenticationService.currentUserValue["userId"];
                this.filteredUsers = this.users.filter(user => user._id !== userId);
            } catch (error) {
                this.$message.error("Failed to load users:", error);
            }
        },
        startPolling() {
            this.pollingTimer = setInterval(this.loadUsers, this.pollingInterval);
        },
        stopPolling() {
            clearInterval(this.pollingTimer);
        },
        handlePositionChange(value) {
            this.newUser.permissionLevel = value === 'Student' ? Role.Surfer : Role.Member;
        },
        async createUser() {
            try {
                const newUser = {
                    firstName: this.newUser.firstName,
                    lastName: this.newUser.lastName,
                    birthday: this.newUser.birthday,
                    userName: this.newUser.userName,
                    email: this.newUser.email,
                    password: this.newUser.password,
                    position: this.newUser.position,
                    permissionLevel: this.newUser.permissionLevel,
                    avatar: this.newUser.avatar,
                    isActive: true,
                    emailStatus: this.newUser.emailStatus,
                };

                await userService.create(newUser);
                this.$message.success("User created successfully. Invitation email sent.");
                this.showAddUserDialog = false;
                await this.loadUsers();
            } catch (error) {
                this.$message.error("Failed to create user:", error);
            }
        },
        async deleteUser(userId) {
            try {
                await userService.deleteUser(userId);
                this.$message.success("User deleted successfully.");
                await this.loadUsers();
            } catch (error) {
                this.$message.error("Failed to delete user:", error);
            }
        },
    },
};
</script>

<style scoped>
/* Add any specific styles here */
</style>
