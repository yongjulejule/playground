import * as E from 'fp-ts/Either';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { IncomingMessage } from 'node:http';

// io-ts 기반의 벨리데이션 함수
function validate<T>(schema: t.Type<T>, data: unknown): T {
  const result = schema.decode(data);
  if (E.isLeft(result)) {
    throw new Error(PathReporter.report(result).join(', '));
  }
  return result.right;
}

export const parseJsonBody = <T>(req: IncomingMessage, schema: t.Type<T>) => {
  return new Promise<T>((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        const body = JSON.parse(data);
        resolve(validate(schema, body));
      } catch (err) {
        reject(err);
      }
    });
  });
};
