import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

export interface EnvConfig {
  mongoUri: string;
  rabbitMQUri: string;
  rabbitMQViewedChannel: string;
  port: number;
  minioEndpoint: string;
  minioAccessKey: string;
  minioSecretKey: string;
}

export const parseEnv = (): E.Either<Error, EnvConfig> => {
  return pipe(
    E.Do,
    E.bind('port', () => parsePort()),
    E.bind('mongoUri', () =>
      parseStringEnv('MONGO_URI', 'mongodb://mongo:27017')
    ),
    E.bind('rabbitMQUri', () =>
      parseStringEnv('RABBITMQ_URI', 'amqp://rabbit:5672')
    ),
    E.bind('rabbitMQViewedChannel', () =>
      parseStringEnv('RABBITMQ_VIEWED_CHANNEL', 'viewed')
    ),
    E.bind('minioEndpoint', () =>
      parseStringEnv('MINIO_ENDPOINT', 'http://localhost:9000')
    ),
    E.bind(
      'minioAccessKey',
      () => parseStringEnv('MINIO_ACCESS_KEY', null, true) // 필수 값
    ),
    E.bind(
      'minioSecretKey',
      () => parseStringEnv('MINIO_SECRET_KEY', null, true) // 필수 값
    )
  );
};

const parseStringEnv = (
  key: string,
  defaultValue: string | null = null,
  required = false
): E.Either<Error, string> => {
  const value = process.env[key] ?? defaultValue;

  if (required && !value) {
    return E.left(new Error(`${key} is required but was not provided`));
  }

  if (value === null) {
    return E.left(
      new Error(`${key} is not defined and no default value provided`)
    );
  }

  return E.right(value);
};

const parsePort = (): E.Either<Error, number> => {
  const port = process.env.PORT;

  return E.tryCatch(
    () => {
      console.log('port', port, typeof port);
      if (port === undefined) {
        console.log('port is undefined');
        throw new Error('PORT is not defined');
      }
      const portNum = parseInt(port, 10);
      if (isNaN(portNum) || portNum <= 0 || portNum > 65535) {
        throw new Error('PORT is not a number');
      }
      return portNum;
    },
    (err) => (err instanceof Error ? err : new Error(String(err)))
  );
};
