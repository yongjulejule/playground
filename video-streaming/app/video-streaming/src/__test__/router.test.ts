import { IncomingMessage, ServerResponse } from 'http';
import { describe, expect, it, vi } from 'vitest';
import { createRouter } from '../router';

describe('Router', () => {
  const mockVideoController = {
    getAllVideos: vi.fn(),
    streamVideo: vi.fn(),
    create: vi.fn(),
  };

  const router = createRouter(mockVideoController);

  const mockReq = (method: string, url: string): IncomingMessage =>
    ({
      method,
      url,
      headers: { host: 'localhost' },
    } as IncomingMessage);

  const mockRes = (): ServerResponse => {
    const res = {} as ServerResponse;
    res.writeHead = vi.fn().mockReturnThis();
    res.end = vi.fn().mockReturnThis();
    return res;
  };

  it('should call getAllVideos for GET /video', () => {
    const req = mockReq('GET', '/video');
    const res = mockRes();

    router(req, res);

    expect(mockVideoController.getAllVideos).toHaveBeenCalledWith(req, res);
  });

  it('should call streamVideo for GET /video-stream', () => {
    const req = mockReq('GET', '/video-stream');
    const res = mockRes();

    router(req, res);

    expect(mockVideoController.streamVideo).toHaveBeenCalledWith(req, res);
  });

  it('should call create for POST /video', () => {
    const req = mockReq('POST', '/video');
    const res = mockRes();

    router(req, res);

    expect(mockVideoController.create).toHaveBeenCalledWith(req, res);
  });

  it('should return 404 for unknown route', () => {
    const req = mockReq('GET', '/unknown');
    const res = mockRes();

    router(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(404, {
      'Content-Type': 'text/plain',
    });
    expect(res.end).toHaveBeenCalledWith('Not Found');
  });
});
