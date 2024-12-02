<template>
    <a-modal :title="isEditMode ? 'Edit User' : 'Add New User'" :visible="isVisible" @ok="handleOk"
        @cancel="handleCancel" ok-text="Save" cancel-text="Cancel" width="700px"
        :footer="isEditMode ? null : undefined">
        <div class="modal-description">
            <p class="text-semibold">
                Please fill in the details for the user. Required fields include personal information, account status,
                and settings.
            </p>
        </div>
        <a-form layout="vertical" :form="form" :style="{ padding: '20px' }">
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="First Name">
                        <a-input
                            v-decorator="['firstName', { rules: [{ required: true, message: 'Please enter the first name' }] }]"
                            placeholder="Enter first name" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Last Name">
                        <a-input
                            v-decorator="['lastName', { rules: [{ required: true, message: 'Please enter the last name' }] }]"
                            placeholder="Enter last name" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Birthday">
                        <a-date-picker v-decorator="['birthday']" style="width: 100%" placeholder="Select birthday" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Username">
                        <a-input
                            v-decorator="['userName', { rules: [{ required: true, message: 'Please enter a unique username' }] }]"
                            placeholder="Enter username" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Email">
                        <a-input
                            v-decorator="['email', { rules: [{ type: 'email', required: true, message: 'Invalid email format' }] }]"
                            placeholder="Enter email" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Password">
                        <a-input-password
                            v-decorator="['password', { rules: [{ required: !isEditMode, message: 'Please enter a password' }] }]"
                            placeholder="Enter password" disabled/>
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Position">
                        <a-select v-decorator="['position']" placeholder="Select position">
                            <a-select-option value="Administrator">Administrator</a-select-option>
                            <a-select-option value="Student">Student</a-select-option>
                            <a-select-option value="Teacher">Teacher</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Permission Level">
                        <a-select v-decorator="['permissionLevel']" placeholder="Select permission level">
                            <a-select-option v-for="role in availableRoles" :key="role.value" :value="role.value">
                                {{ role.label }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Account Status" help="Toggle this switch to mark the account as active or inactive. When inactive, the user will
                            lose access to the system.">
                        <a-switch v-decorator="['isActive']" checked-children="On" un-checked-children="Off"
                            :checked="user ? user.isActive : false" />
                    </a-form-item>

                </a-col>
            </a-row>

            <a-row v-if="isEditMode" style="display: flex; justify-content: flex-end;">
                <a-button type="danger" @click="handleDelete" icon="delete" shape="round">
                    Delete
                </a-button>
                <a-button @click="handleOk" icon="edit" shape="round">
                    Edit
                </a-button>
            </a-row>
        </a-form>
    </a-modal>
</template>

<script>
import { Role } from "../../helpers/roles";

export default {
    props: {
        isVisible: Boolean,
        user: Object,
    },
    data() {
        return {
            isEditMode: !!this.user,
            form: this.$form.createForm(this),
            availableRoles: [
                { value: Role.Surfer, label: "Surfer" },
                { value: Role.Member, label: "Member" },
                { value: Role.Master, label: "Master" },
            ],
        };
    },
    methods: {
        handleOk() {
            this.form.validateFields((errors, values) => {
                if (!errors) {
                    const saved = this.isEditMode ? {
                        ...values,
                        _id: this.user._id,
                    } : values;
                    this.$emit("save-user", saved);
                }
            });
        },
        handleCancel() {
            this.resetForm();
            this.$emit("close");
        },
        handleDelete() {
            this.$emit("delete-user", this.user.id);
        },
        resetForm() {
            this.form.resetFields();
        },
    },
    watch: {
        user: {
            handler(newUser) {
                this.isEditMode = !!newUser;
                this.resetForm();

                if (newUser) {
                    // Ensure the form fields are set only if user data exists
                    this.$nextTick(() => {
                        this.form.setFieldsValue({
                            firstName: newUser.firstName,
                            lastName: newUser.lastName,
                            birthday: newUser.birthday,
                            userName: newUser.userName,
                            email: newUser.email,
                            position: newUser.position,
                            permissionLevel: newUser.permissionLevel,
                            isActive: newUser.isActive,
                        });
                    });
                }
            },
            deep: true,
            immediate: true,
        },
    },
    mounted() {
        this.resetForm();

        // Ensure form is populated when editing
        if (this.isEditMode && this.user) {
            this.form.setFieldsValue(this.user);
        }
    },
};
</script>

<style scoped>
.section {
    padding: 16px;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
}

@media (max-width: 767px) {
    a-modal {
        width: 100%;
    }
}
</style>
