import * as fs from 'node:fs';
import { IncomingMessage, ServerResponse } from 'node:http';
import * as path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as response from '../response';
import * as debugUtils from '../utils/debug-utils';
import { handleVideoRequest } from './controller';

vi.mock('node:fs');
vi.mock('node:path');
vi.mock('../response');
vi.mock('../utils/debug-utils');

describe('handleVideoRequest', () => {
  const mockVideoPath = 'asset/sample.mp4';
  const mockFileSize = 1024;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully stream video file', async () => {
    const req = {
      headers: { host: 'localhost' },
      url: '/video?name=value',
    } as IncomingMessage;
    const res = {
      writeHead: vi.fn(),
      end: vi.fn(),
    } as unknown as ServerResponse;

    const mockStream = {
      pipe: vi.fn(),
      on: vi.fn((event, callback) => {
        if (event === 'end') callback();
        return mockStream;
      }),
    };

    vi.spyOn(path, 'join').mockReturnValue(mockVideoPath);
    vi.spyOn(fs, 'statSync').mockReturnValue({
      size: mockFileSize,
    } as fs.Stats);
    vi.spyOn(fs, 'createReadStream').mockReturnValue(
      mockStream as unknown as fs.ReadStream
    );

    await handleVideoRequest(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': mockFileSize,
    });
    expect(mockStream.pipe).toHaveBeenCalledWith(res);
    expect(res.end).toHaveBeenCalled();
  });

  it('should handle file stat errors', async () => {
    const req = {
      headers: { host: 'localhost' },
      url: '/video?name=value',
    } as IncomingMessage;
    const res = {
      writeHead: vi.fn(),
      end: vi.fn(),
    } as unknown as ServerResponse;

    vi.spyOn(path, 'join').mockReturnValue(mockVideoPath);
    vi.spyOn(fs, 'statSync').mockImplementation(() => {
      throw new Error('File stat error');
    });

    await handleVideoRequest(req, res);

    expect(response.sendResponse).toHaveBeenCalledWith(
      res,
      500,
      'Internal Server Error'
    );
  });

  it('should handle streaming errors', async () => {
    const req = {
      headers: { host: 'localhost' },
      url: '/video?name=value',
    } as IncomingMessage;
    const res = {
      writeHead: vi.fn(),
      end: vi.fn(),
    } as unknown as ServerResponse;

    const mockStream = {
      pipe: vi.fn(),
      on: vi.fn((event, callback) => {
        if (event === 'error') callback(new Error('Stream error'));
        return mockStream;
      }),
    };

    vi.spyOn(path, 'join').mockReturnValue(mockVideoPath);
    vi.spyOn(fs, 'statSync').mockReturnValue({
      size: mockFileSize,
    } as fs.Stats);
    vi.spyOn(fs, 'createReadStream').mockReturnValue(
      mockStream as unknown as fs.ReadStream
    );

    await handleVideoRequest(req, res);

    expect(response.sendResponse).toHaveBeenCalledWith(
      res,
      500,
      'Internal Server Error'
    );
  });

  it('should log debug info when debug is enabled', async () => {
    process.env.DEBUG = 'true';
    const req = {
      headers: { host: 'localhost' },
      url: '/video?name=value',
    } as IncomingMessage;
    const res = {
      writeHead: vi.fn(),
      end: vi.fn(),
    } as unknown as ServerResponse;

    const mockStream = {
      pipe: vi.fn(),
      on: vi.fn((event, callback) => {
        if (event === 'data') callback(Buffer.from('test'));
        if (event === 'end') callback();
        return mockStream;
      }),
    };

    vi.spyOn(debugUtils, 'isDebugEnabled').mockReturnValue(true);
    vi.spyOn(path, 'join').mockReturnValue(mockVideoPath);
    vi.spyOn(fs, 'statSync').mockReturnValue({
      size: mockFileSize,
    } as fs.Stats);
    vi.spyOn(fs, 'createReadStream').mockReturnValue(
      mockStream as unknown as fs.ReadStream
    );

    await handleVideoRequest(req, res);

    expect(debugUtils.debugAction).toHaveBeenCalled();
  });
});
