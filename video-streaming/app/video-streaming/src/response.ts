import { ServerResponse } from 'http';

// === 액션: 응답 처리 ===
// 부수 효과를 처리하는 HTTP 응답
export const sendResponse = (
  res: ServerResponse,
  status: number,
  message: string
): void => {
  if (!res.writableEnded) {
    res.writeHead(status, { 'Content-Type': 'text/plain' });
    res.end(message);
  }
};
