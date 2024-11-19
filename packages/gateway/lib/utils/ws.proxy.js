const WebSocket = require('ws');
const kafkaService = require('@wimp-project/kafka'); // The Kafka service you provided earlier
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

// Subscribe to Kafka topic and relay messages to WebSocket clients
(async () => {
  const topic = 'refresh';
  const groupId = 'wimp-system-id';

  await kafkaService.subscribe(topic, groupId, (message) => {
    console.log('Received message from Kafka:', message);
    broadcastToClients(message); // Relay Kafka message to WebSocket clients
  });
})();
