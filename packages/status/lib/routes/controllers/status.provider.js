const StatusModel = require('../models/status.model');

exports.insert = async (req, res) => {
    try {
        const statusData = { userId: req.body.userId, status: req.body.status };
        const result = await StatusModel.createStatus(statusData);
        res.status(201).send({ id: result._id });
    } catch (error) {
        console.error("Error inserting status:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.getById = async (req, res) => {
    try {
        const result = await StatusModel.findStatusById(req.params.userId);
        if (!result) {
            return res.status(404).send({ message: "User status not found" });
        }
        res.status(200).send(result);
    } catch (error) {
        console.error("Error retrieving status by ID:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const result = await StatusModel.updateStatus(req.params.userId, req.body.status);
        if (!result) {
            return res.status(404).send({ message: "User status not found" });
        }
        res.status(204).send({});
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.removeById = async (req, res) => {
    try {
        const result = await StatusModel.removeStatusById(req.params.userId);
        if (!result) {
            return res.status(404).send({ message: "User status not found" });
        }
        res.status(204).send({});
    } catch (error) {
        console.error("Error removing status by ID:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
