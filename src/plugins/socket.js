import Vue from "vue";

// WebSocket configuration
const SOCKET_URL = process.env.VUE_APP_API_URL || "ws://localhost:3333"; // Replace with your WebSocket server URL
let socket = null;

// Reconnection logic with exponential backoff
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

function connectSocket() {
  socket = new WebSocket(SOCKET_URL);

  socket.addEventListener("open", () => {
    console.log("WebSocket connection established");
    Vue.prototype.$socketConnected = true;
    reconnectAttempts = 0; // Reset attempts on successful connection
  });

  socket.addEventListener("close", (event) => {
    console.log(`WebSocket connection closed: ${event.code}`);
    Vue.prototype.$socketConnected = false;
    attemptReconnect(); // Trigger reconnection
  });

  socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
    Vue.prototype.$socketConnected = false;
    attemptReconnect(); // Trigger reconnection on error
  });
}

function attemptReconnect() {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000); // Exponential backoff, capped at 30 seconds
    reconnectAttempts++;
    console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);

    setTimeout(() => {
      console.log("Reconnecting...");
      connectSocket();
    }, delay);
  } else {
    console.error("Max reconnect attempts reached. Please check your connection.");
  }
}

// Vue plugin to provide the WebSocket client globally
const SocketPlugin = {
  install(Vue) {
    // Inject the socket instance into Vue components
    Vue.prototype.$socket = () => socket;

    Vue.prototype.$subscribeToEvent = function (callback) {
      socket.addEventListener("message", callback);
    };

    Vue.prototype.$unsubscribeFromEvent = function (callback) {
      socket.removeEventListener("message", callback);
    };

    Vue.prototype.$isSocketConnected = function () {
      return socket && socket.readyState === WebSocket.OPEN;
    };
  },
};

// Connect initially and use the plugin
connectSocket();
Vue.use(SocketPlugin);

export default socket;
