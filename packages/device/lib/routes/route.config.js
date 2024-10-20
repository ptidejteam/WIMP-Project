const DeviceProvider = require("./controllers/device.provider");

exports.routesConfig = (app) => {
    // Device management routes
    app.post('/devices', [
        DeviceProvider.insert
    ]);

    app.get('/devices', [
        DeviceProvider.list
    ]);

    app.get('/devices/:deviceId', [
        DeviceProvider.getById
    ]);

    app.put('/devices/:deviceId', [
        DeviceProvider.putById
    ]);

    app.delete('/devices/:deviceId', [
        DeviceProvider.removeById
    ]);

    // Routes to manage devices by user ID
    app.get('/users/:userId/devices', [
        DeviceProvider.getByUserId
    ]);

    // IoT data routes
    app.post('/devices/:deviceId/iot-data', [
        DeviceProvider.addIoTData
    ]);

    app.get('/devices/:deviceId/iot-data', [
        DeviceProvider.getIoTData
    ]);
};
