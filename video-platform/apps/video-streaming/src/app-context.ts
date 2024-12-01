import {
  createMinIOAdapter,
  createMongoConnection,
  createRabbitMQConnection,
  EnvConfig,
  MinIOAdapter,
} from '@video-platform/shared';
import {
  Channel as RabbitMQChannel,
  Connection as RabbitMQConnection,
} from 'amqplib';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { Connection as MongoConnection } from 'mongoose';

export interface AppContext {
  env: EnvConfig;
  rabbitMQConnection: RabbitMQConnection;
  rabbitMQChannel: RabbitMQChannel;
  mongoConnection: MongoConnection;
  minioAdapter: MinIOAdapter;
}

// 컨텍스트 생성 함수
export const createContext = (
  env: EnvConfig
): TE.TaskEither<Error, AppContext> => {
  return pipe(
    createRabbitMQConnection(env.rabbitMQUri), // RabbitMQ 연결
    TE.chain((rabbitMQConnection) =>
      pipe(
        TE.tryCatch(
          async () => {
            const channel = await rabbitMQConnection.createChannel();
            console.info('RabbitMQ channel created');
            channel.on('close', () => console.log('RabbitMQ channel closed'));
            channel.on('error', (error) =>
              console.error('RabbitMQ channel error:', error)
            );
            return channel;
          },
          (reason) =>
            new Error(`Failed to create RabbitMQ channel: ${String(reason)}`)
        ),
        TE.map((rabbitMQChannel) => ({
          rabbitMQConnection,
          rabbitMQChannel,
        }))
      )
    ),
    TE.chain(({ rabbitMQConnection, rabbitMQChannel }) =>
      pipe(
        createMongoConnection(env.mongoUri), // MongoDB 연결
        TE.map((mongoConnection) => ({
          rabbitMQConnection,
          rabbitMQChannel,
          mongoConnection,
        }))
      )
    ),
    TE.map(({ rabbitMQConnection, rabbitMQChannel, mongoConnection }) => ({
      mongoConnection,
      rabbitMQConnection,
      rabbitMQChannel,
      minioAdapter: createMinIOAdapter(
        env.minioEndpoint,
        env.minioAccessKey,
        env.minioSecretKey
      ),
      env,
    }))
  );
};
