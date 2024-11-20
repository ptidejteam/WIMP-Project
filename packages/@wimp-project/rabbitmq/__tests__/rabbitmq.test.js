const amqp = require('amqplib');
const { initializeRabbitMQ, publish, close } = require('../lib/rabbitmq'); // Import your service

jest.mock('amqplib'); // Mock the amqplib module

describe('RabbitMQ Service', () => {
  let mockChannel;
  let mockConnection;

  beforeEach(() => {
    // Mock the channel and connection for RabbitMQ
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(true),
      publish: jest.fn(),
      assertQueue: jest.fn().mockResolvedValue(true),
      consume: jest.fn(),
      ack: jest.fn(),
      nack: jest.fn(),
      close: jest.fn().mockResolvedValue(true),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(true),
    };

    amqp.connect.mockResolvedValue(mockConnection); // Mock the amqp.connect to return the mock connection
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test('should initialize RabbitMQ connection and channel', async () => {
    await initializeRabbitMQ();

    // Check if amqp.connect was called
    expect(amqp.connect).toHaveBeenCalledWith('amqp://localhost');

    // Check if createChannel was called to create a channel
    expect(mockConnection.createChannel).toHaveBeenCalled();
  });

  test('publish should send a message to the specified exchange and routing key', async () => {
    const exchange = 'test_exchange';
    const routingKey = 'test_routing_key';
    const message = { key: 'value' };

    // Call the publish function
    await publish(exchange, routingKey, message);

    // Check if assertExchange was called to assert the exchange
    expect(mockChannel.assertExchange).toHaveBeenCalledWith(exchange, 'direct', { durable: true });

    // Check if publish was called with the correct arguments
    const expectedMessage = Buffer.from(JSON.stringify(message)); // Ensure message is serialized as Buffer
    expect(mockChannel.publish).toHaveBeenCalledWith(
      exchange, 
      routingKey, 
      expectedMessage
    );
  });

  test('publish should handle errors correctly', async () => {
    // Simulate a failure in publish
    mockChannel.publish.mockRejectedValue(new Error('Publish failed'));

    const exchange = 'test_exchange';
    const routingKey = 'test_routing_key';
    const message = { key: 'value' };

    try {
      await publish(exchange, routingKey, message);
    } catch (error) {
      // Check if the error is logged correctly
      expect(error.message).toBe('Publish failed');
    }
  });

  test('should close RabbitMQ connection and channel', async () => {
    await close();

    // Check if the channel and connection are closed
    expect(mockChannel.close).toHaveBeenCalled();
    expect(mockConnection.close).toHaveBeenCalled();
  });
});
