import Vue from "vue";
import io from "socket.io-client";

// WebSocket configuration
const SOCKET_URL = process.env.VUE_APP_API_URL || "http://localhost:3333"; // Replace with your WebSocket server URL

// Create a WebSocket client instance
const socket = io(SOCKET_URL);

// Add a Vue plugin to provide the WebSocket client globally
const SocketPlugin = {
  install(Vue) {
    // Inject the socket instance into Vue components
    Vue.prototype.$socket = socket;

    // Optionally, add helper methods to manage socket events
    Vue.prototype.$subscribeToEvent = function (eventName, callback) {
      socket.on(eventName, callback);
    };

    Vue.prototype.$unsubscribeFromEvent = function (eventName) {
      socket.off(eventName);
    };

    Vue.prototype.$emitSocketEvent = function (eventName, data) {
      socket.emit(eventName, data);
    };
  },
};

// Use the plugin
Vue.use(SocketPlugin);

// Export the socket instance for manual usage if needed
export default socket;
