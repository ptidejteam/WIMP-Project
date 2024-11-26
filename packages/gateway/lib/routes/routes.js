const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env' )});

const API_PREFIX = "api/v1";
const USER_URL = process.env.USER_URL;
const DEVICE_URL = process.env.DEVICE_URL;
const MEETING_URL = process.env.MEETING_URL;

if (!USER_URL) {
  throw new Error("USER_URL is undefined. Check if it is set in the .env file.");
}

if (!DEVICE_URL) {
  throw new Error("DEVICE_URL is undefined. Check if it is set in the .env file.");
}

exports.routes = [
  {
    url: `/${API_PREFIX}/auth`,
    proxy: {
      target: `${USER_URL}/auth`,
      changeOrigin: true,
      pathRewrite: {
        [`^/${API_PREFIX}/auth`]: "",
      },
    },
  },
  {
    url: `/${API_PREFIX}/logout`,
    authenticationRequired: true,
    proxy: {
      target: `${USER_URL}/logout`,
      changeOrigin: true,
      pathRewrite: {
        [`^/${API_PREFIX}/logout`]: "",
      },
    },
  },
  {
    url: `/${API_PREFIX}/refresh`,
    authenticationRequired: true,
    applyBodyParser: true,
    rateLimit: {
      windowsMs: 15 * 60 * 1000,
      max: 5,
    },
    proxy: {
      target: `${USER_URL}/refresh`,
      changeOrigin: true,
      timeout: 3000,
      pathRewrite: {
        [`^/${API_PREFIX}/refresh`]: "",
      },
    },
  },
  // Allow access to /api/v1/users and its sub-paths
  {
    url: `/${API_PREFIX}/users`,  // This will allow /users and all its sub-paths
    authenticationRequired: true,
    proxy: {
      target: `${USER_URL}/users`, 
      changeOrigin: true,
      pathRewrite: {
        [`^/${API_PREFIX}/users`]: "",
      },
    },
  },
  // Allow access to /api/v1/availability and its sub-paths
  {
    url: `/${API_PREFIX}/availability`, // This will allow /availability and all its sub-paths
    authenticationRequired: true,
    proxy: {
      target: `${USER_URL}/availability`, 
      changeOrigin: true,
      pathRewrite: {
        [`^/${API_PREFIX}/availability`]: "",
      },
    },
  },
  {
    url: `/${API_PREFIX}/devices`,
    authenticationRequired: true,
    proxy: {
      target: `${DEVICE_URL}/devices`,
      changeOrigin: true,
      pathRewrite: {
        [`^/${API_PREFIX}/devices`]: "",
      },
    },
  },
  {
    url: `/${API_PREFIX}/meetings`,
    authenticationRequired: true,
    proxy: {
      target: `${MEETING_URL}/meetings`,
      changeOrigin: true,
      pathRewrite: {
        [`^/${API_PREFIX}/meetings`]: "",
      },
    },
  },
  // Add more routes as needed
];
