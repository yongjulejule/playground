import * as E from 'fp-ts/Either';

export const parsePort = (): E.Either<Error, number> => {
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
