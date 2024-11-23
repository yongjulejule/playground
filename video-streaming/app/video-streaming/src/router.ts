import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { IncomingMessage, ServerResponse } from 'http';
import { sendResponse } from './response';
import { handleVideoRequest } from './video';

// 라우트 핸들러 타입
type RouteHandler = (req: IncomingMessage, res: ServerResponse) => void;

// 라우트 정의
const routes: Array<[string, string, RouteHandler]> = [
  ['GET', '/video', handleVideoRequest],
];

// 라우팅 함수
export const routeRequest = (
  req: IncomingMessage,
  res: ServerResponse
): void => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  console.log(`Request: ${req.method} ${url.pathname}`);
  pipe(
    routes.find(
      ([method, routeUrl]) => method === req.method && routeUrl === url.pathname
    ), // 매칭되는 라우트 찾기
    O.fromNullable, // Optional로 변환
    O.match(
      () => sendResponse(res, 404, 'Not Found'), // 매칭 실패 시 404 처리
      ([, , handler]) => handler(req, res) // 매칭 성공 시 핸들러 호출
    )
  );
};
