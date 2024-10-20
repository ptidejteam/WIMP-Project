const IdentityModel = require("../models/identity.model");
const { hashPassword } = require("@wimp-project/utils");

// Insert a new identity
exports.insert = async (req, res) => {
  try {
    const hashedPassword = hashPassword(req.body.password);
    req.body.password = hashedPassword;

    const result = await IdentityModel.createIdentity(req.body);
    res.status(201).send({ id: result._id });
  } catch (error) {
    console.error("Error inserting identity:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// List identities with pagination
exports.list = async (req, res) => {
  try {
    const limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    const page = req.query.page && Number.isInteger(parseInt(req.query.page)) ? parseInt(req.query.page) : 0;

    const result = await IdentityModel.list(limit, page);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error listing identities:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Get identity by user ID
exports.getById = async (req, res) => {
  try {
    const result = await IdentityModel.findById(req.params.userId);
    if (!result) {
      return res.status(404).send({ message: "Identity not found" });
    }
    res.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving identity by ID:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Update identity by user ID
exports.putById = async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = hashPassword(req.body.password);
    }

    const result = await IdentityModel.putIdentity(req.params.userId, req.body);
    if (!result) {
      return res.status(404).send({ message: "Identity not found" });
    }
    res.status(204).send({});
  } catch (error) {
    console.error("Error updating identity by ID:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Remove identity by user ID
exports.removeById = async (req, res) => {
  try {
    const result = await IdentityModel.removeById(req.params.userId);
    if (!result) {
      return res.status(404).send({ message: "Identity not found" });
    }
    
    res.status(204).send({});
    
  } catch (error) {
    console.error("Error removing identity by ID:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
