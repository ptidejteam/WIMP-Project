const WebSocket = require("ws");
// const service = require('@wimp-project/kafka'); // The Kafka service you provided earlier
const service = require("@wimp-project/rabbitmq");
const PORT = process.env.WS_PORT || 3000;

// Create a WebSocket server
const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`WebSocket server started on ws://localhost:${PORT}`);
});

// Track connected WebSocket clients
const clients = new Set();

// On WebSocket connection
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  clients.add(ws);

  // Remove client on disconnect
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });
});

// Function to broadcast messages to all connected clients
function broadcastToClients(message) {
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
    broadcastToClients(message); // Relay Kafka message to WebSocket clients
  };

  // Set up the subscription to the RabbitMQ queue with the specific exchange and routing key
  await service.subscribe(queue, messageHandler, {
    exchange, // The exchange to bind the queue to
    routingKey, // The routing key for binding
  });
})();
