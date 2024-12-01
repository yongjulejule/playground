import amqplib, { Connection } from 'amqplib';
import * as TE from 'fp-ts/TaskEither';

export const createRabbitMQConnection = (
  uri: string
): TE.TaskEither<Error, Connection> =>
  TE.tryCatch(
    async () => {
      const retryInterval = 5000; // 5 seconds
      const maxRetries = 10; // Maximum retries to avoid infinite loops

      const connectWithRetry = async (
        retriesLeft: number
      ): Promise<Connection> => {
        try {
          const connection = await amqplib.connect(uri);
          if (!connection) {
            throw new Error('Failed to connect to RabbitMQ');
          }
          connection.on('close', () => {
            console.log('RabbitMQ connection closed');
          });
          connection.on('error', (error) => {
            console.error('RabbitMQ connection error:', error);
          });
          console.log('RabbitMQ connected successfully');
          return connection;
        } catch (error) {
          if (retriesLeft <= 0) {
            console.error('RabbitMQ connection failed after retries');
            throw new Error('Failed to connect to RabbitMQ after retries');
          }
          console.error(
            `RabbitMQ connection error, retrying in ${
              retryInterval / 1000
            } seconds...`,
            error
          );
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
          return connectWithRetry(retriesLeft - 1);
        }
      };

      return connectWithRetry(maxRetries);
    },
    (reason) => new Error(`RabbitMQ connection failed: ${String(reason)}`)
  );

export const closeRabbitMQConnection = (): TE.TaskEither<Error, void> =>
  TE.tryCatch(
    async () => {
      console.log('RabbitMQ connection closed successfully');
    },
    (reason) =>
      new Error(`Failed to close RabbitMQ connection: ${String(reason)}`)
  );

export const VIDEO_VIEW_EXCHANGE_KEY = 'video-viewed3' as const;
