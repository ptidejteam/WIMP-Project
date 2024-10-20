const API_PREFIX = "api/v1";
const USER_URL = process.env.USER_URL;
const DEVICE_URL = process.env.FLOW_URL;
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
