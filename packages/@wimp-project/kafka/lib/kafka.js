'use strict';

const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'], // Replace with your Kafka broker(s)
});

let producer = null;
const consumers = {};

/**
 * Initializes the Kafka producer and establishes a connection.
 * Ensures the producer is ready to send messages.
 * @async
 * @throws Will throw an error if the producer fails to connect.
 */
async function initializeProducer() {
  if (!producer) {
    producer = kafka.producer();
    try {
      await producer.connect();
      console.log('Producer connected');
    } catch (error) {
      console.error('Failed to connect producer:', error.message);
      throw error;
    }
  }
}


/**
 * Publishes a message to a specified Kafka topic.
 * Automatically initializes the producer if it's not already connected.
 * @async
 * @param {string} topic - The Kafka topic to publish to.
 * @param {string|Object} message - The message to send. Objects will be serialized to JSON.
 * @throws Will log an error if the message fails to send.
 */
async function publish(topic, message) {
  if (!producer) await initializeProducer();

  try {
    const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message;
    await producer.send({
      topic,
      messages: [{ value: formattedMessage }],
    });
    console.log(`Message sent to topic ${topic}: ${formattedMessage}`);
  } catch (error) {
    console.error('Error publishing message:', error.message);
  }
}

/**
 * Subscribes to a Kafka topic with a specified consumer group.
 * Invokes a callback function for every message received.
 * @async
 * @param {string} topic - The Kafka topic to subscribe to.
 * @param {string} groupId - The consumer group ID.
 * @param {function} callback - A function invoked with the message content as a string.
 * @throws Will log an error if the consumer fails to connect or process messages.
 */
async function subscribe(topic, groupId, callback) {
  if (!consumers[groupId]) {
    const consumer = kafka.consumer({ groupId });

    try {
      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: true });
      console.log(`Subscribed to topic ${topic} with groupId ${groupId}`);

      consumers[groupId] = consumer;

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            callback(message.value.toString());
          } catch (error) {
            console.error('Error processing message:', error.message);
          }
        },
      });
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error.message);
    }
  } else {
    console.log(`Consumer for groupId ${groupId} already exists.`);
  }
}

/**
 * Closes all active Kafka connections, including producers and consumers.
 * Useful for application shutdown or cleanup.
 * @async
 * @throws Will log an error if any connection fails to close.
 */
async function close() {
  try {
    // Close all consumers
    await Promise.all(Object.values(consumers).map(consumer => consumer.disconnect()));

    if (producer) {
      await producer.disconnect();
    }

    console.log('Kafka connection closed');
  } catch (error) {
    console.error('Error closing Kafka connections:', error.message);
  }
}

/**
 * Utility function to retry an asynchronous operation.
 * Useful for handling transient errors like network issues.
 * @async
 * @param {function} operation - The operation to retry (must return a promise).
 * @param {number} [retries=3] - The number of retry attempts.
 * @param {number} [delay=1000] - The delay between retries in milliseconds.
 * @returns {Promise<*>} The result of the operation.
 * @throws Will throw an error if the operation fails after all retries.
 */
async function retryOperation(operation, retries = 3, delay = 1000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Operation failed after retries');
}

// Graceful shutdown handlers for SIGINT and SIGTERM signals
process.on('SIGINT', async () => {
  console.log('SIGINT received, closing Kafka connections...');
  await close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing Kafka connections...');
  await close();
  process.exit(0);
});

// Export the functions for external use
module.exports = {
  publish,
  subscribe,
  close,
};
