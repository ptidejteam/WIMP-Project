const StatusProvider = require("./controllers/status.provider");

exports.routesConfig = (app) => {
    // Status management routes
    app.post('/statuses', [
        StatusProvider.insert
    ]);

    app.get('/statuses/:userId', [
        StatusProvider.getById
    ]);

    app.put('/statuses/:userId', [
        StatusProvider.updateStatus
    ]);

    app.delete('/statuses/:userId', [
        StatusProvider.removeById
    ]);
};
