const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const { routesConfig } = require("../path/to/device.routes"); // Adjust the path
const app = express();

app.use(bodyParser.json());
routesConfig(app);

describe("Device API", () => {
    let deviceId;

    it("should create a new device", (done) => {
        request(app)
            .post("/devices")
            .send({
                name: "Device A",
                userId: "userId123", // Replace with a valid user ID
                status: "active",
            })
            .expect(201)
            .then((response) => {
                deviceId = response.body.id; // Save the created device ID for later tests
                done();
            })
            .catch((err) => done(err));
    });

    it("should list all devices", (done) => {
        request(app)
            .get("/devices")
            .expect(200)
            .then((response) => {
                expect(response.body).to.be.an("array");
                done();
            })
            .catch((err) => done(err));
    });

    it("should get a device by ID", (done) => {
        request(app)
            .get(`/devices/${deviceId}`)
            .expect(200)
            .then((response) => {
                expect(response.body).to.have.property("_id", deviceId);
                done();
            })
            .catch((err) => done(err));
    });

    it("should update a device by ID", (done) => {
        request(app)
            .put(`/devices/${deviceId}`)
            .send({ status: "inactive" })
            .expect(204)
            .then(() => done())
            .catch((err) => done(err));
    });

    it("should delete a device by ID", (done) => {
        request(app)
            .delete(`/devices/${deviceId}`)
            .expect(204)
            .then(() => done())
            .catch((err) => done(err));
    });

    it("should return 404 for non-existing device", (done) => {
        request(app)
            .get(`/devices/nonExistingId`)
            .expect(404)
            .then(() => done())
            .catch((err) => done(err));
    });
});
