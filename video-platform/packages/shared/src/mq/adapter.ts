import { Channel } from 'amqplib';

export const createRabbitMqAdapter = (channel: Channel) => {
  const exchanges = new Set<string>();
  return {
    // RabbitMQ 메시지 전송
    publish: async (exchange: string, routingKey: string, message: string) => {
      try {
        console.info('Publishing message:', message);
        channel.publish(exchange, routingKey, Buffer.from(message));
        console.info('Message published successfully');
      } catch (error) {
        console.error('Failed to publish message:', error);
        throw new Error('Failed to publish message');
      }
    },

    exchange: async (exchange: string, type: string) => {
      if (exchanges.has(exchange)) {
        return exchange;
      }
      try {
        console.info('Creating exchange:', exchange);
        await channel.assertExchange(exchange, type, { durable: true });
        exchanges.add(exchange);
        console.info('Exchange created successfully');
        return exchange;
      } catch (error) {
        console.error('Failed to create exchange:', error);
        throw new Error('Failed to create exchange');
      }
    },

    // RabbitMQ 메시지 수신
    subscribe: async (
      exchange: string,
      queue: string,
      routingKey: string,
      handler: (message: string) => Promise<void>
    ) => {
      try {
        console.info('Subscribing to messages...');
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        await channel.consume(queue, async (message) => {
          if (!message) {
            return;
          }

          const content = message.content.toString();
          console.info('Message received:', content);
          await handler(content);

          channel.ack(message);
        });
      } catch (error) {
        console.error('Failed to subscribe to messages:', error);
        throw new Error('Failed to subscribe to messages');
      }
    },
  };
};

export type RabbitMqAdapter = ReturnType<typeof createRabbitMqAdapter>;
