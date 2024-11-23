import { ServerResponse } from 'http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendResponse } from '../response';

describe('sendResponse', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should send a response with the given status and message', () => {
    const res = {
      writableEnded: false,
      writeHead: vi.fn(),
      end: vi.fn(),
    } as unknown as ServerResponse;
    sendResponse(res, 200, 'OK');

    expect(res.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'text/plain',
    });
    expect(res.end).toHaveBeenCalledWith('OK');
  });

  it('should not send a response if writableEnded is true', () => {
    const res = {
      writableEnded: true,
      writeHead: vi.fn(),
      end: vi.fn(),
    } as unknown as ServerResponse;

    sendResponse(res, 200, 'OK');

    expect(res.writeHead).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });
});
