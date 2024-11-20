'use strict';

const amqp = require('amqplib');

let connection = null;
let channel = null;

/**
 * Initializes the RabbitMQ connection and channel with retries.
 * @async
 * @param {string} url - The RabbitMQ server URL.
 * @param {number} [retryCount=5] - Number of retries for establishing a connection.
 * @throws Will throw an error if the connection or channel fails to initialize after retries.
 */
async function initializeRabbitMQ(url = 'amqp://localhost', retryCount = 5) {
  if (connection && channel) return;

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      connection = await amqp.connect(url);
      channel = await connection.createChannel();
      console.log('Connected to RabbitMQ');
      return;
    } catch (error) {
      console.error(`Attempt ${attempt} to connect to RabbitMQ failed:`, error.message);
      if (attempt === retryCount) throw new Error('Failed to establish RabbitMQ connection after multiple retries');
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait before retrying
    }
  }
}

/**
 * Publishes a message to a RabbitMQ exchange with various exchange types.
 * @async
 * @param {string} exchange - The RabbitMQ exchange to publish to.
 * @param {string} routingKey - The routing key for the message.
 * @param {string|Object} message - The message to send. Objects will be serialized to JSON.
 * @param {string} [exchangeType='direct'] - The type of exchange ('direct', 'topic', 'fanout', 'headers').
 * @throws Will log an error if the message fails to send.
 */
async function publish(exchange, routingKey, message, exchangeType = 'direct') {
  if (!channel) await initializeRabbitMQ();

  try {
    const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message;
    console.log(`Assert Exchange: ${exchange}`);

    await channel.assertExchange(exchange, exchangeType, { durable: true });
    console.log('Exchange asserted');

    channel.publish(exchange, routingKey, Buffer.from(formattedMessage));
    console.log(`Message sent to exchange "${exchange}" with routingKey "${routingKey}":`, formattedMessage);
  } catch (error) {
    console.error('Error publishing message:', error.message);
    throw error;
  }
}

/**
 * Subscribes to a RabbitMQ queue, optionally binding it to an exchange.
 * @async
 * @param {string} queue - The RabbitMQ queue to subscribe to.
 * @param {function} callback - A function to process incoming messages.
 * @param {Object} [options] - Optional parameters for binding the queue.
 * @param {string} [options.exchange] - Exchange to bind the queue to.
 * @param {string} [options.routingKey='#'] - Routing key for binding (default: all messages).
 * @param {boolean} [options.noAck=false] - Whether to auto-acknowledge messages.
 * @throws Will log an error if the subscription fails.
 */
async function subscribe(queue, callback, options = {}) {
  if (!channel) await initializeRabbitMQ();

  const { exchange, routingKey = '#', noAck = false } = options;

  try {
    await channel.assertQueue(queue, { durable: true });

    if (exchange) {
      await channel.assertExchange(exchange, 'topic', { durable: true });
      await channel.bindQueue(queue, exchange, routingKey);
      console.log(`Queue "${queue}" bound to exchange "${exchange}" with routing key "${routingKey}"`);
    }

    console.log(`Subscribed to queue "${queue}"`);
    channel.consume(queue, (msg) => {
      if (msg) {
        try {
          const messageContent = msg.content.toString();
          callback(messageContent);
          if (!noAck) channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error.message);
          if (!noAck) channel.nack(msg);
        }
      }
    });
  } catch (error) {
    console.error(`Error subscribing to queue "${queue}":`, error.message);
    throw error;
  }
}

/**
 * Closes the RabbitMQ connection and channel.
 * @async
 * @throws Will log an error if any connection fails to close.
 */
async function close() {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    console.log('RabbitMQ connection closed');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error.message);
    throw error;
  }
}

// Graceful shutdown handlers for SIGINT and SIGTERM signals
process.on('SIGINT', async () => {
  console.log('SIGINT received, closing RabbitMQ connections...');
  await close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing RabbitMQ connections...');
  await close();
  process.exit(0);
});

// Export the functions for external use
module.exports = {
  initializeRabbitMQ,
  publish,
  subscribe,
  close,
};
