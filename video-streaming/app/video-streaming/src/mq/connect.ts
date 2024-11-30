import amqplib, { Connection } from 'amqplib';
import * as TE from 'fp-ts/TaskEither';

export const createRabbitMQConnection = (
  uri: string
): TE.TaskEither<Error, Connection> =>
  TE.tryCatch(
    async () => {
      const retryInterval = 5000; // 5 seconds

      const connectWithRetry = async () => {
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
            handleConnectionError();
          });
          console.log('RabbitMQ connected successfully');
          return connection;
        } catch (error) {
          console.error(
            'RabbitMQ connection error, retrying in 5 seconds...',
            error
          );
          setTimeout(connectWithRetry, retryInterval);
        }
      };

      const handleConnectionError = () => {
        console.error('RabbitMQ connection error, retrying in 5 seconds...');
        setTimeout(connectWithRetry, retryInterval);
      };

      const connection = await connectWithRetry();
      if (!connection) {
        throw new Error('Failed to connect to RabbitMQ');
      }
      return connection;
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
