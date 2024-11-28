<template>
    <!-- Users Table Card -->
    <a-card :bordered="false" :bodyStyle="{ padding: '16px' }">

        <template #title>
            <div class="header">
                <div class="header-info">
                    <h6 class="font-semibold m-0">Users Control Panel</h6>
                    <small style="font-style: italic;">Updated: {{ lastUpdated | dateTime }}</small>
                </div>
                <a-button icon="plus" type="link" @click="isModalVisible = true">Add</a-button>
            </div>
        </template>
        <template v-if="!users">
            <a-skeleton />
        </template>
        <a-table v-else :columns="columns" :data-source="filteredUsers" :pagination="false"
            :rowKey="record => record._id">
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
                <a-tag class="tag-status"
                    :class="record.emailStatus === 'verified' ? 'ant-tag-success' : 'ant-tag-warning'">
                    {{ record.emailStatus }}
                </a-tag>
            </template>
        </a-table>
        <UserFormModal :isVisible="isModalVisible" :user="selectedUser" @close="isModalVisible = false" @save-user="saveUser" @delete-user="deleteUser"/>
    </a-card>
</template>

<script>
import { AuthenticationService } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import UserFormModal from '../Modals/UserFormModal.vue';

export default {
    components: {
        UserFormModal
    },
    data() {
        return {
            users: null,
            userId : AuthenticationService.currentUserValue.userId,
            isModalVisible: false,
            lastUpdated : null,
            selectedUser: null, // Initial selected user is null
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
                }
            ],
        };
    },
    computed: { 
        filteredUsers() { 
            return this.users?.filter(user => user._id !== this.userId);
        }
    },
    mounted() {
        this.loadUsers();
    },
    methods: {
        async loadUsers() {
            try {
                const users = await userService.getAll();
                this.users = users.data;
                this.lastUpdated = Date.now();

            } catch (error) {
                this.$message.error("Failed to load users:", error);
            }
        },
        async saveUser() {
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
</style>
