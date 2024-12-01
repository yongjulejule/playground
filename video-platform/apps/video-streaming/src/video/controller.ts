import { debugAction, parseJsonBody } from '@video-platform/shared';
import { IncomingMessage, ServerResponse } from 'http';
import * as t from 'io-ts';
import { VideoService } from './service';

const createVideoDto = t.type({
  title: t.string,
  path: t.string,
  duration: t.number,
  size: t.number,
});

export const createVideoController = (service: VideoService) => ({
  getAllVideos: async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const videos = await service.getAllVideos();
      console.log('found video', videos);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(videos));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      const message =
        err instanceof Error ? err.message : 'Internal Server Error';
      res.end(`Error: ${message}`);
    }
  },

  create: async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await parseJsonBody(req, createVideoDto);
      const video = await service.createVideo(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(video));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      const message =
        err instanceof Error ? err.message : 'Internal Server Error';
      res.end(`Error: ${message}`);
    }
  },

  streamVideo: async (req: IncomingMessage, res: ServerResponse) => {
    const videoId = new URL(
      req.url || '',
      `http://${req.headers.host}`
    ).searchParams.get('id');

    let isResponseSent = false;

    if (!videoId) {
      if (!isResponseSent) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing video ID');
        isResponseSent = true;
      }
      return;
    }

    try {
      await service.viewVideo(videoId);
      const video = await service.getVideoById(videoId);
      debugAction(() => console.log('found video', video));

      const stream = await service.streamVideo(video.path);

      // 헤더 전송
      res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Length': video.size,
      });

      // 스트림 데이터를 클라이언트로 전송
      stream.pipe(res);

      stream.on('data', (chunk) => {
        debugAction(() =>
          console.info(`Streaming chunk: ${chunk.length} bytes`)
        );
      });

      // 스트림 종료 처리
      stream.on('end', () => {
        if (!isResponseSent) {
          isResponseSent = true;
          res.end();
          console.info('Streaming completed successfully');
        }
      });

      // 스트림 에러 처리
      stream.on('error', (err) => {
        console.error(`Stream error: ${err.message}`);
        if (!isResponseSent) {
          isResponseSent = true;
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      });

      // 클라이언트가 연결을 끊었을 때 처리
      res.on('close', () => {
        if (!isResponseSent) {
          isResponseSent = true;
          console.warn('Client closed the connection');
        }
      });
    } catch (err) {
      if (!isResponseSent) {
        console.error(`Error in streaming video: ${err}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        const message =
          err instanceof Error ? err.message : 'Internal Server Error';
        res.end(`Error: ${message}`);
      }
    }
  },
});

export type VideoController = ReturnType<typeof createVideoController>;
