import axios from "axios";
import { requestOptions } from "./auth.header";
import { handleErrorResponse } from "../helpers/handle-response";

const API_URL = process.env.VUE_APP_API_URL || "http://localhost:50052/api/v1";

export const availabilityService = {
  setUserStatus,
  setTrackingOption,
  setAvailabilityStatus,
  setCustomMessage,
  setDisplayOption,
  setDefaultMessages,
  getAvailabilityById,
  getAllWithAvailability
};

// Define the interceptor for axios
axios.interceptors.response.use((response) => {
  return response;
}, handleErrorResponse);


// Fetches all users with additional availability data
async function getAllWithAvailability() {
  return axios.get(`${API_URL}/availability`, requestOptions.header());
 
 }

function getAvailabilityById(userId) { 
  return axios.get(`${API_URL}/availability/${userId}`,requestOptions.header());
}

function setUserStatus(userId, isOnline) {
  return axios.patch(`${API_URL}/availability/status`, { userId, isOnline },requestOptions.header());
}
function setTrackingOption(userId, allowOfflineMode) {
  return axios.patch(`${API_URL}/availability/tracking`, {
    userId,
    allowOfflineMode,
  },requestOptions.header());
}
function setAvailabilityStatus(userId, availabilityStatus) {
  return axios.patch(`${API_URL}/availability`, {
    userId,
    availabilityStatus,
  },requestOptions.header());
}
function setCustomMessage(userId, customMessage) {
  return axios.patch(`${API_URL}/availability`, { userId, customMessage },requestOptions.header());
}
function setDisplayOption(userId, displayToOthers) {
  return axios.patch(`${API_URL}/availability`, { userId, displayToOthers },requestOptions.header());
}
function setDefaultMessages(data) {
  return axios.patch(`${API_URL}/availability/defaultMessages`,data ,requestOptions.header());
}
