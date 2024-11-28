<template>
    <a-modal :title="isEditMode ? 'Edit User' : 'Add New User'" :visible="isVisible" @ok="handleOk"
        @cancel="handleCancel" ok-text="Save" cancel-text="Cancel" width="700px" :footer="modalFooter">
        <!-- Modal Description Section -->
        <div class="modal-description">
            <p class="text-semibold">
                Please fill in the details for the new user. We need their first name, last name, birthday, username,
                email, password, and position. Feel free to add any extra information if you'd like!
            </p>

        </div>
        <a-form layout="vertical" :form="form" :style="{ padding: '20px' }">
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="First Name" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                        <a-input v-decorator="['firstName', {
                            rules: [{ required: true, message: 'Please enter the first name' }]
                        }]" placeholder="Enter first name" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Last Name" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                        <a-input v-decorator="['lastName', {
                            rules: [{ required: true, message: 'Please enter the last name' }]
                        }]" placeholder="Enter last name" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Birthday" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                        <a-date-picker v-decorator="['birthday']" style="width: 100%" placeholder="Select birthday" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Username" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                        <a-input v-decorator="['userName', {
                            rules: [{ required: true, message: 'Please enter a unique username' }]
                        }]" placeholder="Enter username" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Email" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                        <a-input v-decorator="['email', {
                            rules: [{ type: 'email', message: 'Invalid email format', required: true }]
                        }]" placeholder="Enter email" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Password" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                        <a-input-password v-decorator="['password', {
                            rules: [{ required: !isEditMode, message: 'Please enter a password' }]
                        }]" placeholder="Enter password" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Position" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                        <a-select v-decorator="['position']" placeholder="Select position">
                            <a-select-option value="Student">Student</a-select-option>
                            <a-select-option value="Teacher">Teacher</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row v-if="isEditMode" justify="end">
                <a-button type="danger" @click="handleDelete" style="margin-top: 16px; width: 100%" icon="delete" block>
                    Delete User
                </a-button>
            </a-row>
        </a-form>
    </a-modal>
</template>

<script>
export default {
    props: {
        isVisible: {
            type: Boolean,
            required: true,
        },
        user: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            isEditMode: !!this.user, // Set edit mode based on whether a user is provided
            form: this.$form.createForm(this), // Create Ant Design form instance

        };
    },
    computed: {
        modalFooter() {
            return this.isEditMode ? null : [
                <a-button key="cancel" onClick={this.handleCancel}>Cancel</a-button>,
                <a-button key="submit" type="primary" onClick={this.handleOk}>Save</a-button>,
            ];
        },
    },
    methods: {
        handleOk() {
            this.form.validateFields((errors, values) => {
                if (!errors) {
                    this.$emit('save-user', values); // Emit save event with form data
                    this.resetForm();
                }
            });
        },
        handleCancel() {
            this.resetForm();
            this.$emit('close'); // Emit close event to hide modal

        },
        handleDelete() {
            this.$emit('delete-user', this.user.id); // Emit delete event with the user's ID
        },
        resetForm() {
            this.form.resetFields(); // Reset the form to its initial state
        },
    },
    mounted() {
        if (this.user) {
            this.$nextTick(() => {
                // If in edit mode, populate the form with the user data
                this.form.setFieldsValue({ ...this.user });
            });
        }
    },
};
</script>

<style scoped>
a-modal {
    border-radius: 10px;
    padding: 10px;
}

a-form {
    background-color: #fafafa;
    border-radius: 8px;
}

a-form-item {
    margin-bottom: 16px;
}

a-button[type="danger"] {
    background-color: #ff4d4f;
    color: white;
    border-color: #ff4d4f;
    font-weight: bold;
}

a-button[type="danger"]:hover {
    background-color: #ff7875;
    border-color: #ff7875;
}

a-input,
a-input-password,
a-select {
    border-radius: 8px;
}

a-input:focus,
a-input-password:focus,
a-select:focus {
    border-color: #1890ff;
}

a-button[block] {
    display: block;
    width: 100%;
}

@media (max-width: 767px) {
    a-modal {
        width: 100%;
    }
}
</style>