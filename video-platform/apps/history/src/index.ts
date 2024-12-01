import {
  createRabbitMqAdapter,
  debugAction,
  isDebugEnabled,
  VIDEO_VIEW_EXCHANGE_KEY,
} from '@video-platform/shared';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { AppContext, createContext } from './app-context';
import { createHistoryController } from './history/controller';
import { createHistoryRepository } from './history/repository';
import { createHistoryService } from './history/service';
import { parseEnv } from './parse-env';
import { createRouter } from './router';

// HTTP 서버 실행 함수
const startHttpServer = (context: AppContext): TE.TaskEither<Error, void> => {
  return TE.tryCatch(
    async () => {
      const { env, mongoConnection, rabbitMQConnection, rabbitMQChannel } =
        context;

      const repository = createHistoryRepository(mongoConnection);
      const rabbitMqAdapter = createRabbitMqAdapter(rabbitMQChannel);
      const service = createHistoryService(repository, rabbitMqAdapter);
      const controller = createHistoryController(service);
      const router = createRouter(controller);
      const server = createServer(router);

      const exchange = await rabbitMqAdapter.exchange(
        VIDEO_VIEW_EXCHANGE_KEY,
        'fanout'
      );

      rabbitMqAdapter.subscribe(exchange, 'test', 'viewed', async (message) => {
        console.log(`Received message: `, message);
        const { videoId } = JSON.parse(message);
        repository.create({ videoId, userId: randomUUID() });
      });
      server.listen(env.port, () => {
        console.log(`Server is running on http://localhost:${env.port}`);
      });

      // Graceful Shutdown 처리
      process.on('SIGINT', async () => {
        console.log('Shutting down...');
        await mongoConnection.close();
        await rabbitMQConnection.close();
        console.log('Connections closed. Goodbye!');
        process.exit(0);
      });
    },
    (reason) => new Error(`Failed to start HTTP server: ${String(reason)}`)
  );
};

// Main 함수
const main = () => {
  debugAction(() => console.info(`Debug mode: ${isDebugEnabled()}`));

  pipe(
    TE.fromEither(parseEnv()), // 환경 변수 검증
    TE.chain((env) =>
      pipe(
        createContext(env), // AppContext 생성
        TE.chain(startHttpServer) // HTTP 서버 실행
      )
    ),
    TE.match(
      (error) => {
        console.error(`Failed to initialize application: ${error.message}`);
        console.error(error);
        process.exit(1); // 초기화 실패 시 종료
      },
      () => {
        console.log('Application initialized successfully');
      }
    )
  )();
};

main();
