import {
  createRabbitMqAdapter,
  debugAction,
  isDebugEnabled,
  parseEnv,
} from '@video-platform/shared';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { createServer } from 'node:http';
import { AppContext, createContext } from './app-context';
import { createRouter } from './router';
import { createVideoController } from './video/controller';
import { createVideoRepository } from './video/repository';
import { createVideoService } from './video/service';

// HTTP 서버 실행 함수
const startHttpServer = (context: AppContext): TE.TaskEither<Error, void> => {
  return TE.tryCatch(
    async () => {
      const {
        env,
        mongoConnection,
        rabbitMQConnection,
        minioAdapter,
        rabbitMQChannel,
      } = context;

      const repository = createVideoRepository(mongoConnection);
      const minIoAdapter = minioAdapter;
      const rabbitMqAdapter = createRabbitMqAdapter(rabbitMQChannel);
      const service = createVideoService(
        repository,
        minIoAdapter,
        rabbitMqAdapter
      );
      const controller = createVideoController(service);
      const router = createRouter(controller);
      const server = createServer(router);

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
