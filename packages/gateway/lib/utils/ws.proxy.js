const WebSocket = require("ws");
const service = require("@wimp-project/rabbitmq");
const PORT = process.env.WS_PORT || 3000;

// Allowed origin for CORS
const ALLOWED_ORIGIN = ["http://localhost:8080","http://192.168.0.198:8080"];

// Create a WebSocket server
const wss = new WebSocket.Server(
  { 
    port: PORT, 
    handleProtocols: (protocols, req) => protocols[0],
    // Manually handle CORS by inspecting the origin header
    // verifyClient: (info, callback) => {
    //   const origin = info.origin;
    //   console.log(`New WebSocket connection attempt from origin: ${origin}`);
    //   if (ALLOWED_ORIGIN.includes(origin)) {
    //     callback(true);  // Accept the connection
    //   } else {
    //     callback(false, 403, "Forbidden: Invalid Origin");  // Reject the connection
    //   }
    // }
  },
  () => {
    console.log(`WebSocket server started on ws://localhost:${PORT}`);
  }
);

// Track connected WebSocket clients
const clients = new Set();

// On WebSocket connection
wss.on("connection", (ws, req) => {
  const origin = req.headers.origin; // Capture the origin header
  console.log(`New WebSocket client connected from origin: ${origin}`);

  // Add client to the set
  clients.add(ws);

  // Remove client on disconnect
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    clients.delete(ws);
  });
});

// Function to broadcast messages to all connected clients
function broadcastToClients(message) {
  console.log("-----------------------------------------------------");
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Subscribe to RabbitMQ queue and relay messages to WebSocket clients
(async () => {
  const queue = "refresh"; // Get the queue name from environment variables
  const exchange = "front"; // Exchange name
  const routingKey = "wimp-system"; // Routing key

  // Message handler function for processing the incoming message
  const messageHandler = (message) => {
    console.log("Received message from RabbitMQ:", message);
    broadcastToClients(message); // Relay RabbitMQ message to WebSocket clients
  };

  // Set up the subscription to the RabbitMQ queue with the specific exchange and routing key
  await service.subscribe(queue, messageHandler, {
    exchange, // The exchange to bind the queue to
    routingKey, // The routing key for binding
  });
})();
