const request = require('supertest');
const express = require('express');
const { routesConfig } = require('../lib/routes/routes.config'); // Adjust the path accordingly
const DeviceProvider = require('../lib/routes/controllers/device.provider');
const DeviceModel = require('../lib/routes/models/device.model'); // Adjust the path accordingly

// Mock the DeviceModel methods
jest.mock('../lib/routes/models/device.model');

const app = express();
app.use(express.json()); // for parsing application/json
routesConfig(app); // Initialize your routes

describe('Device API Endpoints', () => {
    const mockDevice = { 
        name: 'Device1', 
        type: 'Sensor', 
        userId: 'user123', 
        status: 'active',
        data: {}
    };

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should create a new device (POST /devices)', async () => {
        DeviceModel.createDevice.mockResolvedValue({ _id: '1', ...mockDevice });

        const response = await request(app).post('/devices').send(mockDevice);

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ id: '1' });
        expect(DeviceModel.createDevice).toHaveBeenCalledWith(mockDevice);
    });

    it('should return 500 when inserting fails (POST /devices)', async () => {
        DeviceModel.createDevice.mockRejectedValue(new Error('Database Error'));

        const response = await request(app).post('/devices').send(mockDevice);

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: "Internal Server Error" });
    });

    it('should list all devices (GET /devices)', async () => {
        DeviceModel.list.mockResolvedValue([mockDevice]);

        const response = await request(app).get('/devices');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([mockDevice]);
        expect(DeviceModel.list).toHaveBeenCalled();
    });

    it('should return 500 when listing devices fails (GET /devices)', async () => {
        DeviceModel.list.mockRejectedValue(new Error('Database Error'));

        const response = await request(app).get('/devices');

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: "Internal Server Error" });
    });

    it('should get device by ID (GET /devices/:deviceId)', async () => {
        DeviceModel.findById.mockResolvedValue(mockDevice);

        const response = await request(app).get('/devices/1');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(mockDevice);
        expect(DeviceModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when device not found (GET /devices/:deviceId)', async () => {
        DeviceModel.findById.mockResolvedValue(null);

        const response = await request(app).get('/devices/1');

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: "Device not found" });
    });

    it('should return 500 when retrieving device by ID fails (GET /devices/:deviceId)', async () => {
        DeviceModel.findById.mockRejectedValue(new Error('Database Error'));

        const response = await request(app).get('/devices/1');

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: "Internal Server Error" });
    });

    it('should update device by ID (PUT /devices/:deviceId)', async () => {
        DeviceModel.putDevice.mockResolvedValue(mockDevice);

        const updatedDevice = { ...mockDevice, name: 'Updated Device' };
        
        const response = await request(app).put('/devices/1').send(updatedDevice);

        expect(response.statusCode).toBe(204);
        expect(DeviceModel.putDevice).toHaveBeenCalledWith('1', updatedDevice);
    });

    it('should return 404 when updating a non-existent device (PUT /devices/:deviceId)', async () => {
        DeviceModel.putDevice.mockResolvedValue(null);

        const updatedDevice = { ...mockDevice, name: 'Updated Device' };
        
        const response = await request(app).put('/devices/1').send(updatedDevice);

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: "Device not found" });
    });

    it('should return 500 when updating fails (PUT /devices/:deviceId)', async () => {
        DeviceModel.putDevice.mockRejectedValue(new Error('Database Error'));

        const updatedDevice = { ...mockDevice, name: 'Updated Device' };

        const response = await request(app).put('/devices/1').send(updatedDevice);

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: "Internal Server Error" });
    });

    it('should delete device by ID (DELETE /devices/:deviceId)', async () => {
        DeviceModel.removeById.mockResolvedValue(true);

        const response = await request(app).delete('/devices/1');

        expect(response.statusCode).toBe(204);
        expect(DeviceModel.removeById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when deleting a non-existent device (DELETE /devices/:deviceId)', async () => {
        DeviceModel.removeById.mockResolvedValue(null);

        const response = await request(app).delete('/devices/1');

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: "Device not found" });
    });

    it('should return 500 when deleting fails (DELETE /devices/:deviceId)', async () => {
        DeviceModel.removeById.mockRejectedValue(new Error('Database Error'));

        const response = await request(app).delete('/devices/1');

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: "Internal Server Error" });
    });

    it('should get devices by user ID (GET /users/:userId/devices)', async () => {
        DeviceModel.getByUserId.mockResolvedValue([mockDevice]);

        const response = await request(app).get('/users/user123/devices');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([mockDevice]);
        expect(DeviceModel.getByUserId).toHaveBeenCalledWith('user123');
    });

    it('should return 500 when getting devices by user ID fails (GET /users/:userId/devices)', async () => {
        DeviceModel.getByUserId.mockRejectedValue(new Error('Database Error'));

        const response = await request(app).get('/users/user123/devices');

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: "Internal Server Error" });
    });

    it('should add IoT data to a device (POST /devices/:deviceId/iot-data)', async () => {
        const iotData = { temperature: 22, humidity: 45 };
        DeviceModel.addIoTData.mockResolvedValue({ success: true });

        const response = await request(app).post('/devices/1/iot-data').send(iotData);

        expect(response.statusCode).toBe(201);
        expect(DeviceModel.addIoTData).toHaveBeenCalledWith('1', iotData);
    });

    it('should return 500 when adding IoT data fails (POST /devices/:deviceId/iot-data)', async () => {
        const iotData = { temperature: 22, humidity: 45 };
        DeviceModel.addIoTData.mockRejectedValue(new Error('Database Error'));

        const response = await request(app).post('/devices/1/iot-data').send(iotData);

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: "Internal Server Error" });
    });

    it('should get IoT data from a device (GET /devices/:deviceId/iot-data)', async () => {
        const iotData = [{ timestamp: '2023-01-01T00:00:00Z', value: 22 }];
        DeviceModel.getIoTData.mockResolvedValue(iotData);

        const response = await request(app).get('/devices/1/iot-data');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(iotData);
        expect(DeviceModel.getIoTData).toHaveBeenCalledWith('1');
    });

    it('should return 500 when getting IoT data fails (GET /devices/:deviceId/iot-data)', async () => {
        DeviceModel.getIoTData.mockRejectedValue(new Error('Database Error'));

        const response = await request(app).get('/devices/1/iot-data');

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: "Internal Server Error" });
    });
});
