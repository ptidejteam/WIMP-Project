import axios from 'axios';
import { requestOptions } from './auth.header';
import { handleErrorResponse } from '../helpers/handle-response';
const API_URL = process.env.VUE_APP_API_URL || "http://localhost:50052/api/v1";

export const deviceService = {
    getAll,
    getById,
    create,
    deleteDevice,
    patch,
    getIoTData
};
// define the interceptor for axios 
axios.interceptors.response.use(response => { 
  return response
},handleErrorResponse)  


function getAll() {
    return axios.get(`${API_URL}/devices`, requestOptions.header())
}

function getById(id) {
    return axios.get(`${API_URL}/devices/${id}`, requestOptions.header())
}

function create(body) { 
    return axios.post(`${API_URL}/devices`,body,requestOptions.header());
}

function deleteDevice(id) { 
    return axios.delete(`${API_URL}/devices/${id}`, requestOptions.header())
}

function patch(id,body){
    return axios.patch(`${API_URL}/devices/${id}`,body, requestOptions.header())
}



function getIoTData(id){
    return axios.get(`${API_URL}/devices/${id}/iot-data`, requestOptions.header())
}