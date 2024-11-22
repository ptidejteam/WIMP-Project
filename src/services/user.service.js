import axios from 'axios';
import { requestOptions } from './auth.header';
import { handleErrorResponse } from '../helpers/handle-response';

const API_URL = process.env.VUE_APP_API_URL || "http://localhost:50052/api/v1";

export const userService = {
    getAll,
    getAllWithAvailability,
    getById,
    create,
    deleteUser,
    putUser,
    generateTempPassword,
    sendInviteEmail,
    deleteUserPrivacy,
};

// Define the interceptor for axios to handle response errors
axios.interceptors.response.use(
    response => response,
    handleErrorResponse
);

function getAll() {
    return axios.get(`${API_URL}/users`, requestOptions.header());
}
// Fetches all users with additional availability data
async function getAllWithAvailability() {
    return axios.get(`${API_URL}/availability`, requestOptions.header());
   
   }


function getById(id) {
    return axios.get(`${API_URL}/users/${id}`, requestOptions.header());
}

function create(body) { 
    return axios.post(`${API_URL}/users`, body, requestOptions.header());
}
function deleteUser(id) { 
    return axios.delete(`${API_URL}/users/${id}`, requestOptions.header());
}
function deleteUserPrivacy(id) { 
    return axios.delete(`${API_URL}/users/${id}/privacy`, requestOptions.header());
}


// Generate a temporary password with customizable length and charset
function generateTempPassword() {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
}

// Send invite email to the user with their temporary password
async function sendInviteEmail(email, tempPassword) {
    return await axios.post(`${API_URL}/invite`, { email, tempPassword }, requestOptions.header());
}

// Handles updating user with optional file upload
function putUser(id, body, file = null) {
    if (file) {
        const formData = new FormData();
        Object.keys(body).forEach(key => formData.append(key, body[key]));
        formData.append('file', file); // Attach file if provided

        return axios.put(`${API_URL}/users/${id}`, formData, {
            headers: {
                ...requestOptions.header(),
                'Content-Type': 'multipart/form-data',
            }
        });
    } else {
        return axios.put(`${API_URL}/users/${id}`, body, requestOptions.header());
    }
}
