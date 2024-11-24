import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { ServerResponse } from 'http';
import { createReadStream, statSync } from 'node:fs';
import { join } from 'node:path';
import { sendResponse } from '../response';
import { debugAction } from '../utils/debug-utils';
import { createVideoRepository } from './repository';

// === 데이터 정의 ===
// 비디오 파일 경로를 데이터로 관리
const getVideoPath = (fileName = 'sample.mp4'): string =>
  join('asset', fileName);

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

export const handleVideoStreamRequest = async (
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

export const createVideoService = (
  repository: ReturnType<typeof createVideoRepository>
) => {
  return {
    // 비즈니스 로직: 비디오 생성
    createVideo: async (video: {
      title: string;
      path: string;
      duration: number;
      size: number;
    }) => {
      const { title, path, duration, size } = video;
      // 비즈니스 검증 로직 추가 가능
      if (duration <= 0 || size <= 0) {
        throw new Error('Invalid video duration or size');
      }
      return repository.create(title, path, duration, size);
    },

    // 비즈니스 로직: 모든 비디오 조회
    getAllVideos: async () => {
      return repository.findAll();
    },

    // 비즈니스 로직: 비디오 ID로 조회
    getVideoById: async (id: string) => {
      const video = await repository.findById(id);
      if (!video) {
        throw new Error('Video not found');
      }
      return video;
    },

    // 비즈니스 로직: 비디오 삭제
    deleteVideoById: async (id: string) => {
      const video = await repository.deleteById(id);
      if (!video) {
        throw new Error('Video not found');
      }
      return video;
    },
  };
};

export type VideoService = ReturnType<typeof createVideoService>;