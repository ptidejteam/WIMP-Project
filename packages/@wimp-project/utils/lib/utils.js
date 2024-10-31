'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require("crypto");

module.exports = {
  readSecurityFile,
  hashPassword
}

function readSecurityFile() {
  // Use path.join to create the correct relative path
  const privateKeyPath = path.join(__dirname, '../tls/private.key');
  try {
    return fs.readFileSync(privateKeyPath, { encoding: 'utf-8' });
  } catch (error) {
    // Handle any errors that might occur during file reading, e.g., the file doesn't exist.
   // console.error('Error reading private.key:', error.message);
    throw Error("Can't read the file private.key" + error.message);
  }
}

// Helper function to hash passwords (externalize if reusable)
function hashPassword (password) {
  const salt = crypto.randomBytes(16).toString("base64");
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384 }).toString("base64");
  return `${salt}$${hash}`;
};