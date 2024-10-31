import axios from "axios";
import { requestOptions } from "./auth.header"; // Ensure this file exists
import { handleErrorResponse } from "../helpers/handle-response";

const API_URL = process.env.VUE_APP_API_URL || "http://localhost:50052/api/v1";

export const meetingService = {
  createMeeting,
  listMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  listMeetingsRequested
};

// Define the interceptor for axios
axios.interceptors.response.use(response => { 
    return response
  },handleErrorResponse)  

// Create a new meeting
async function createMeeting(meetingData) {
  return axios.post(`${API_URL}/meetings`, meetingData, requestOptions.header());
}

// Fetch all meetings
async function listMeetings() {
  return axios.get(`${API_URL}/meetings`, requestOptions.header());
}

async function listMeetingsRequested(userId) {
  return axios.get(`${API_URL}/meetings/${userId}`, requestOptions.header());
}

// Fetch a meeting by ID
async function getMeetingById(meetingId) {
  return axios.get(`${API_URL}/meetings/${meetingId}`, requestOptions.header());
}

// Update a meeting by ID
async function updateMeeting(meetingData) {
  return axios.patch(`${API_URL}/meetings`, meetingData, requestOptions.header());
}

// Delete a meeting by ID
async function deleteMeeting(meetingId) {
  return axios.delete(`${API_URL}/meetings/${meetingId}`, requestOptions.header());
}
