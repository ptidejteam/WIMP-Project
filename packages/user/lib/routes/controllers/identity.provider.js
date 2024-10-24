const IdentityModel = require("../models/identity.model");
const { hashPassword } = require("@wimp-project/utils");
const fs = require("fs");
const multer = require("multer");
const path = require("path"); // Ensure to include 'path' for file extension handling

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set the destination folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Use original file extension
  },
});

const upload = multer({ storage });

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
    const limit = Math.min(req.query.limit ? parseInt(req.query.limit) : 10, 100);
    const page = Math.max(req.query.page ? parseInt(req.query.page) : 0, 0);

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

    const result = await IdentityModel.updateById(req.params.userId, req.body);
    if (!result) {
      return res.status(404).send({ message: "Identity not found" });
    }
    res.status(204).send(); // No content response
  } catch (error) {
    console.error("Error updating identity by ID:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Avatar upload function
exports.uploadAvatar = (req, res) => {
  upload.single("avatar")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to upload avatar", error: err });
    }
    if (req.file) {
      const avatarPath = `/uploads/${req.file.filename}`; // Path to the uploaded file

      // Update the user's avatar in the database
      try {
        const result = await IdentityModel.updateById(req.params.userId, { avatar: avatarPath });
        if (!result) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Avatar uploaded successfully", avatarPath });
      } catch (error) {
        console.error("Error updating avatar:", error);
        res.status(500).json({ message: "Error updating avatar", error });
      }
    } else {
      console.log("No file field defined");
      res.status(400).json({ message: "No file uploaded" });
    }
  });
};

// Remove identity by user ID
exports.removeById = async (req, res) => {
  try {
    const result = await IdentityModel.removeById(req.params.userId);
    if (!result) {
      return res.status(404).send({ message: "Identity not found" });
    }

    res.status(204).send(); // No content response
  } catch (error) {
    console.error("Error removing identity by ID:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
