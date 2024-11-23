import { IncomingMessage, ServerResponse } from 'http';
import { VideoService } from './service';

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

  streamVideo: async (req: IncomingMessage, res: ServerResponse) => {
    const videoId = new URL(
      req.url || '',
      `http://${req.headers.host}`
    ).searchParams.get('id');
    if (!videoId) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing video ID');
      return;
    }

    try {
      const video = await service.getVideoById(videoId);
      if (!video) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Video not found');
        return;
      }
      // TODO: Implement streaming logic

      res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Length': video.size,
      });

      // Here you can implement streaming logic
      res.end('Stream started (mock)');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      const message =
        err instanceof Error ? err.message : 'Internal Server Error';
      res.end(`Error: ${message}`);
    }
  },
});
