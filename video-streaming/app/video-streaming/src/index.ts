import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { createServer } from 'node:http';
import { createMongoConnection } from './db/connect';
import { createRouter } from './router';
import { debugAction, isDebugEnabled } from './utils/debug-utils';
import { parsePort } from './utils/parse-port';
import { createVideoRepository } from './video/repository';
import { createVideoService } from './video/service';

// HTTP 서버 시작
const main = () => {
  debugAction(() => console.info(`Debug mode: ${isDebugEnabled()}`));
  const mongoUri = process.env.MONGO_URI ?? 'mongodb://localhost:27017'; // TODO: parsePort 와 통합
  console.log(`MongoDB URI: ${mongoUri}`);
  const port = process.env.PORT;

  pipe(
    TE.fromEither(parsePort()),
    TE.chain(() => createMongoConnection(mongoUri)), // MongoDB 연결
    TE.chain((connection) =>
      TE.tryCatch(
        async () => {
          const repository = createVideoRepository(connection);
          const service = createVideoService(repository);
          const router = createRouter(service);

          const server = createServer(router);
          server.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
          });

          // Graceful Shutdown 처리
          process.on('SIGINT', () => {
            console.log('Shutting down...');
            pipe(
              TE.tryCatch(
                async () => {
                  await connection.close();
                },
                (reason) =>
                  new Error(
                    `Failed to close MongoDB connection: ${String(reason)}`
                  )
              ),
              TE.match(
                (error) => {
                  console.error(error.message);
                  process.exit(1);
                },
                () => {
                  console.log('MongoDB connection closed. Goodbye!');
                  process.exit(0);
                }
              )
            )();
          });

          return connection;
        },
        (reason) => new Error(`Failed to initialize server: ${String(reason)}`)
      )
    ),
    TE.match(
      (error) => {
        console.error(`Failed to initialize server: ${error.message}`);
        process.exit(1);
      },
      () => console.log('Server initialized successfully')
    )
  )();
};

main();
