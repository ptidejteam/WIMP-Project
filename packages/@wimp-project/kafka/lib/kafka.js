'use strict';

const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'], // Replace with your Kafka broker(s)
});

let producer = null;
const consumers = {};

// Function to connect to Kafka
try {
  producer = kafka.producer();
  await producer.connect();
  console.log('Connected to Kafka');
  } catch (error) {
    console.error('Error connecting to Kafka:', error.message);
    throw error;
  }


  
// Function to publish messages
async function publish(topic, message) {
  if (!producer) {
    console.error('Producer is not initialized. Please connect first.');
    return;
  }

  try {
    await producer.send({
      topic: topic,
      messages: [{ value: message }],
    });
    console.log(`Message sent to topic ${topic}: ${message}`);
  } catch (error) {
    console.error('Error publishing message:', error.message);
  }
}

// Function to subscribe to messages
async function subscribe(topic, groupId, callback) {
  // Create a new consumer if it doesn't exist for this groupId
  if (!consumers[groupId]) {
    const consumer = kafka.consumer({ groupId });

    await consumer.connect();
    await consumer.subscribe({ topic: topic, fromBeginning: true });
    console.log(`Subscribed to topic ${topic} with groupId ${groupId}`);

    // Store the consumer in the consumers object
    consumers[groupId] = consumer;

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        callback(message.value.toString());
      },
    });
  } else {
    console.log(`Consumer for groupId ${groupId} already exists.`);
  }
}

// Function to close connections
async function close() {
  // Close all consumers
  await Promise.all(Object.values(consumers).map(consumer => consumer.disconnect()));

  if (producer) {
    await producer.disconnect();
  }

  console.log('Kafka connection closed');
}

// Exporting the functions
module.exports = {
  publish,
  subscribe,
  close,
};
