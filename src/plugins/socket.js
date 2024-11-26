import Vue from "vue";

// WebSocket configuration
const SOCKET_URL = process.env.VUE_APP_API_URL || "ws://localhost:3333"; // Replace with your WebSocket server URL

// Create a WebSocket client instance
const socket = new WebSocket(SOCKET_URL);

// Add a Vue plugin to provide the WebSocket client globally
const SocketPlugin = {
  install(Vue) {
    // Inject the socket instance into Vue components
    Vue.prototype.$socket = socket;

    // Optionally, add helper methods to manage socket events
    Vue.prototype.$subscribeToEvent = function (callback) {
      socket.addEventListener("message", callback);
    };

    Vue.prototype.$unsubscribeFromEvent = function (callback) {
      socket.removeEventListener("message", callback);
    };

    // Test WebSocket connection and handle events
    socket.addEventListener("open", () => {
      console.log("WebSocket connection established");
      // Optionally notify the application or set a flag for a successful connection
      Vue.prototype.$socketConnected = true;
    });

    socket.addEventListener("close", (event) => {
      console.log(`WebSocket connection closed: ${event.code}`);
      // Handle connection closure (e.g., notify the app or attempt reconnection)
      Vue.prototype.$socketConnected = false;
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error: ", error);
      // Handle connection error (e.g., log it or notify the user)
      Vue.prototype.$socketConnected = false;
    });

    // Optionally, provide a method to check connection status
    Vue.prototype.$isSocketConnected = function () {
      return socket.readyState === WebSocket.OPEN;
    };
  },
};

// Use the plugin
Vue.use(SocketPlugin);

// Export the socket instance for manual usage if needed
export default socket;
