import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import { createServer } from 'node:http';
import { routeRequest } from './router';
import { debugAction, isDebugEnabled } from './utils/debug-utils';
import { parsePort } from './utils/parse-port';

// HTTP 서버 시작
const main = (): void => {
  debugAction(() => console.info(`Debug mode: ${isDebugEnabled()}`));

  pipe(
    parsePort(),
    E.match(
      (err) => {
        console.error(err);
        process.exit(1);
      },
      (port) => {
        const server = createServer((req, res) => routeRequest(req, res));

        server.listen(port, () =>
          console.log(`Server is listening on port ${port}`)
        );
      }
    )
  );
};

main();
