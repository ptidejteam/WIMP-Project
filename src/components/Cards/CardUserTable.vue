<template>
    <a-card :bordered="false" :bodyStyle="{ padding: '16px' }">
        <template #title>
            <div class="header">
                <div class="header-info">
                    <h6 class="font-semibold m-0">Users Control Panel</h6>
                    <small style="font-style: italic;">Updated: {{ lastUpdated | dateTime }}</small>
                </div>
                <a-button icon="plus" type="link" @click="openUserModal()">Add</a-button>
            </div>
        </template>

        <template v-if="!users">
            <a-skeleton />
        </template>

        <a-table v-else :columns="columns" :data-source="filteredUsers" :pagination="false"
            :rowKey="record => record._id" :scroll="{ x: 'max-content' }">
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
                <a-tag :class="record.isActive ? 'ant-tag-primary' : 'ant-tag-muted'">
                    {{ record.isActive ? "Active" : "Inactive" }}
                </a-tag>
            </template>

            <template slot="actions" slot-scope="record">
                <a-button type="link" icon="edit" @click="openUserModal(record)">Edit</a-button>
            </template>
        </a-table>

        <UserFormModal :isVisible="isModalVisible" :user="selectedUser" @close="closeUserModal" @save-user="saveUser"
            @delete-user="deleteUser" />
    </a-card>
</template>


<script>
import { AuthenticationService } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import UserFormModal from '../Modals/UserFormModal.vue';

export default {
    components: { UserFormModal },
    data() {
        return {
            users: null,
            userId: AuthenticationService.currentUserValue.userId,
            isModalVisible: false,
            lastUpdated: null,
            selectedUser: null, // Holds the user being edited
            columns: [
                { title: 'Username', key: 'userDetails', scopedSlots: { customRender: 'userDetails' } },
                { title: 'Position', key: 'position', scopedSlots: { customRender: 'position' } },
                { title: 'Status', key: 'status', scopedSlots: { customRender: 'status' } },
                { title: 'Actions', key: 'actions', fixed: "right", scopedSlots: { customRender: 'actions' } }
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
                const response = await userService.getAll();
                this.users = response.data;
                this.lastUpdated = Date.now();
            } catch (error) {
                this.$message.error("Failed to load users.");
            }
        },
        openUserModal(user = null) {
            console.log(user);
            this.selectedUser = user ? { ...user } : null;
            this.isModalVisible = true;
        },
        closeUserModal() {
            this.isModalVisible = false;
            this.selectedUser = null;
        },
        async saveUser(user) {
            try {
                console.log("-----------------------");
                console.log(user);
                if (user._id) {
                    await userService.updateUser(user._id, user); // Update existing user
                    this.$message.success("User updated successfully.");
                } else {
                    await userService.create(user); // Create new user
                    this.$message.success("User created successfully.");
                }
                await this.loadUsers();
            } catch (error) {
                this.$notification['error']({
                    message: 'Failed to save user.',
                    description:
                        error.response.data.message,
                });

            } finally {
                this.closeUserModal();
            }
        },
        async deleteUser(userId) {
            try {
                await userService.deleteUser(userId);
                this.$message.success("User deleted successfully.");
                await this.loadUsers();
            } catch (error) {
                this.$message.error("Failed to delete user.");
            }
        }
    },
    filters: {
        dateTime(value) {
            return new Date(value).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        }
    }
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
