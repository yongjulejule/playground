import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { IncomingMessage, ServerResponse } from 'http';
import { sendResponse } from './response';
import { createVideoController } from './video/controller';

// 라우트 핸들러 타입
type RouteHandler = (req: IncomingMessage, res: ServerResponse) => void;

// 의존성을 주입받아 라우트를 설정하는 함수
export const createRouter = (
  videoController: ReturnType<typeof createVideoController>
): RouteHandler => {
  // 라우트 정의
  const routes: Array<[string, string, RouteHandler]> = [
    ['GET', '/video', videoController.getAllVideos], // 모든 비디오 조회
    ['GET', '/video-stream', videoController.streamVideo], // 비디오 스트리밍
    ['POST', '/video', videoController.create], // 비디오 업로드
  ];

  // 라우팅 함수
  return (req: IncomingMessage, res: ServerResponse): void => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    console.log(`Request: ${req.method} ${url.pathname}`);
    pipe(
      routes.find(
        ([method, routeUrl]) =>
          method === req.method && routeUrl === url.pathname
      ), // 매칭되는 라우트 찾기
      O.fromNullable, // Optional로 변환
      O.match(
        () => sendResponse(res, 404, 'Not Found'), // 매칭 실패 시 404 처리
        ([, , handler]) => handler(req, res) // 매칭 성공 시 핸들러 호출
      )
    );
  };
};
