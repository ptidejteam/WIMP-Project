const IdentityModel = require("../models/identity.model");
const { hashPassword } = require("@wimp-project/utils");



// Insert a new identity
exports.insert = async (req, res) => {
  try {
    // Check if the email is already in use
    const existingUser = await IdentityModel.findByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).send({ message: "Email already in use" });
    }
    const hashedPassword = hashPassword(req.body.password);
    req.body.password = hashedPassword;
    console.log(JSON.stringify(req.body));
    const result = await IdentityModel.create(req.body);
    res.status(201).send({ id: result._id });
  } catch (error) {
    console.error("Error inserting identity:", JSON.stringify(error));
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// List identities with pagination
exports.list = async (req, res) => {
  try {
    const limit = Math.min(
      req.query.limit ? parseInt(req.query.limit) : 10,
      100
    );
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

    // Check if the email is being changed and already in use
    if (req.body.email) {
      const existingUser = await IdentityModel.findByEmail(req.body.email);
      if (existingUser && existingUser._id.toString() !== req.params.userId) {
        return res.status(400).send({ message: "Email already in use" });
      }
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
      return res
        .status(500)
        .json({ message: "Failed to upload avatar", error: err });
    }
    if (req.file) {
      const avatarPath = `/uploads/${req.file.filename}`; // Path to the uploaded file

      // Update the user's avatar in the database
      try {
        const result = await IdentityModel.updateById(req.params.userId, {
          avatar: avatarPath,
        });
        if (!result) {
          return res.status(404).json({ message: "User not found" });
        }
        res
          .status(200)
          .json({ message: "Avatar uploaded successfully", avatarPath });
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

exports.saveGoogleToken = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).send({ message: "User ID is required." });
    }

    const result = await IdentityModel.saveGoogleToken(userId);
    res.status(201).send({ id: result._id });
  } catch (error) {
    console.error("Error inserting or updating user availability:", error);
    res
      .status(500)
      .send({
        message:
          "Internal Server Error. Could not insert or update user availability.",
      });
  }
};

exports.updatePrivacy = async (req, res) => {
  try {
    const userId = req.params.userId || req.body?.userId;
    if (!userId)
      return res.status(400).send({ message: "User ID is required." });
    const result = await IdentityModel.removeGoogleToken(userId);
    res.status(200).send({ message: "Account Privacy has been cleared" });
  } catch (error) {
    console.error("Error inserting or updating user privacy:", error);
    res
      .status(500)
      .send({
        message:
          "Internal Server Error. Could not insert or update user privacy.",
      });
  }
};
