const {
  refresh_secret,
  jwtValidityTimeInSeconds,
} = require("../env.config.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { readSecurityFile } = require("@wimp-project/utils");
const { publish } = require("@wimp-project/rabbitmq");

const cert = readSecurityFile();

exports.login = (req, res) => {
  try {
    const { userId, jti } = req.body;

    // Construct refresh ID using userId, refresh_secret, and jti
    const refreshId = `${userId}${refresh_secret}${jti}`;

    // Create a salt and hash for the refresh token
    const salt = crypto.randomBytes(16).toString("base64");
    const hash = crypto
      .createHmac("sha512", salt)
      .update(refreshId)
      .digest("base64");

    // Generate JWT token using RS512 algorithm
    const token = jwt.sign(req.body, cert, { algorithm: "RS512" });

    // Combine salt and hash for refresh token
    const refreshToken = `${salt}$${hash}`;
    // Respond with tokens
    res.status(201).send({ accessToken: token, refreshToken });
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).send({ errors: "Login failed. Please try again." });
  }
};

exports.refresh_token = (req, res) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const updatedPayload = {
      ...req.body,
      iat: now, // issued at
      exp: now + jwtValidityTimeInSeconds, // expiration time
    };

    // Generate new access token
    const token = jwt.sign(updatedPayload, cert, { algorithm: "RS512" });

    // Respond with the new access token
    res.status(201).send({ accessToken: token });
  } catch (err) {
    console.error("Error during token refresh:", err.message);
    res.status(500).send({ errors: "Token refresh failed. Please try again." });
  }
};

exports.resetRefreshSecret = (_req, res) => {
  try {
    config.initRefreshSecret(); // Assuming this function correctly resets the secret
    res.status(204).send(); // No content to send
  } catch (err) {
    console.error("Error resetting refresh secret:", err.message);
    res
      .status(500)
      .send({ errors: "Failed to reset refresh secret. Please try again." });
  }
};

exports.logout = (req, res) => {
  try {
    const { _id } = req.body;
    //Help to clear some lingering connection - or information that messes up the flow
    publish("user-disconnection", "wimp-system", { _id })
      .then(() => console.log("notification sent"))
      .catch((err) => console.error(err));
    console.log(_id);
  } catch (err) {
    console.error("Something went wrong with logout functionnality");
    res.status(500).send({
      errors: "Failed to logout correctly. Please contact the maintainer.",
    });
  }
};
