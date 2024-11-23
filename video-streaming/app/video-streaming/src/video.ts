import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { IncomingMessage, ServerResponse } from 'http';
import { createReadStream, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { sendResponse } from './response';
import { debugAction } from './utils/debug-utils';

// === 데이터 정의 ===
// 비디오 파일 경로를 데이터로 관리
const getVideoPath = (fileName = 'sample.mp4'): string =>
  join('asset', fileName);

// === 디렉토리에서 MP4 파일 가져오기 ===
const fetchVideoFileList = (dir: string): E.Either<Error, string[]> =>
  E.tryCatch(
    () => {
      const files = readdirSync(dir); // 디렉토리 읽기
      return files.filter((file) => extname(file).toLowerCase() === '.mp4'); // mp4 파일만 필터링
    },
    (err) => (err instanceof Error ? err : new Error(String(err)))
  );

// === 액션: 파일 통계 가져오기 ===
// 외부 시스템(파일 시스템)에서 데이터를 가져오는 액션
const fetchFileStats = (path: string): E.Either<Error, { size: number }> =>
  E.tryCatch(
    () => {
      const { size } = statSync(path); // 동기 작업
      return { size };
    },
    (err) => (err instanceof Error ? err : new Error(String(err)))
  );

// === 액션: 스트리밍 처리 ===
const streamVideoFile = (
  path: string,
  res: ServerResponse
): TE.TaskEither<Error, void> =>
  TE.tryCatch(
    () =>
      new Promise<void>((resolve, reject) => {
        const stream = createReadStream(path); // 스트림 액션
        stream.pipe(res);

        // debug purpose
        stream.on('data', (chunk) => {
          debugAction(() =>
            console.info(`Streaming chunk: ${chunk.length} bytes`)
          );
        });

        // 스트리밍 완료 처리
        stream.on('end', () => resolve());

        // 에러 처리
        stream.on('error', (err) => reject(err));
      }),
    (err) => (err instanceof Error ? err : new Error(String(err)))
  );

// === HTML 파일 리스트 생성 ===
const generateFileListHTML = (files: string[]): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Video Files</title>
</head>
<body>
  <h1>Available Videos</h1>
  <ul>
    ${files
      .map(
        (file) =>
          `<li><a href="?name=${encodeURIComponent(file)}">${file}</a></li>`
      )
      .join('')}
  </ul>
</body>
</html>
`;

const handleFileListRequest = (res: ServerResponse, baseDir: string): void => {
  pipe(
    fetchVideoFileList(baseDir), // 디렉토리의 파일 리스트 가져오기
    E.map((files) => {
      const html = generateFileListHTML(files);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    }),
    E.match(
      (error) => {
        console.error(`Error fetching video list: ${error.message}`);
        sendResponse(res, 500, 'Internal Server Error');
      },
      () => {
        console.info('Video file list sent successfully');
      }
    )
  );
};

const handleVideoStreamRequest = async (
  res: ServerResponse,
  fileName: string
): Promise<void> => {
  const path = getVideoPath(fileName);
  debugAction(() => console.info(`Video path: ${path}`));

  await pipe(
    fetchFileStats(path), // 파일 통계 액션
    E.map((stat) => {
      res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Length': stat.size,
      });
      return path;
    }),
    TE.fromEither, // Either를 TaskEither로 변환
    TE.flatMap((path) => streamVideoFile(path, res)), // 스트리밍 액션
    TE.match(
      (error) => {
        console.error(`Error handling video request: ${error.message}`);
        sendResponse(res, 500, 'Internal Server Error');
      },
      () => {
        res.end();
        console.info('Video streamed successfully');
      }
    )
  )();
};

export const handleVideoRequest = async (
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  debugAction(() =>
    console.log(`Request: ${req.method} ${url.pathname} ${url.search}`)
  );

  const fileName = url.searchParams.get('name'); // 쿼리에서 파일명 추출
  const baseDir = join('asset'); // 비디오 파일 디렉토리 경로

  // 쿼리에 파일명이 없는 경우 파일 목록 반환
  if (!fileName) {
    handleFileListRequest(res, baseDir);
    return;
  }

  await handleVideoStreamRequest(res, fileName);
};
