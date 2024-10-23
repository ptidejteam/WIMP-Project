const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env' )});

const API_PREFIX = "api/v1";
const USER_URL = process.env.USER_URL;
const DEVICE_URL = process.env.DEVICE_URL;

if (!USER_URL) {
  throw  new Error("USER_URL is undefined. Check if it is set in the .env file.");
}

if (!DEVICE_URL) {
  throw new Error("DEVICE_URL is undefined. Check if it is set in the .env file.");
}
exports.routes = [
  {
    url: `/${API_PREFIX}/login`,
    proxy: {
      target: `${USER_URL}/login`,
      changeOrigin: true,
      pathRewrite: {
        [`^/${API_PREFIX}/login`]: "",
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
  {
    url: `/${API_PREFIX}/users`,
    authenticationRequired: true,
    proxy: {
      target: `${USER_URL}/users`,
      changeOrigin: true,
      pathRewrite: {
        [`^/${API_PREFIX}/users`]: "",
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
  // Add more routes as needed
];
