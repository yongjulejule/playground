import { IncomingMessage, ServerResponse } from 'http';
import { VideoHistory } from './service';

export const createHistoryController = (service: VideoHistory) => ({
  findMany: async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const videos = await service.findMany();
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
});

export type HistoryController = ReturnType<typeof createHistoryController>;
