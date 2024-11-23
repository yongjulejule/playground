import { IncomingMessage, ServerResponse } from 'http';
import { describe, expect, it, vi } from 'vitest';
import { sendResponse } from '../response';
import { routeRequest } from '../router';
import { handleVideoRequest } from '../video/controller';

vi.mock('../response');
vi.mock('../video/controller');

describe('routeRequest', () => {
  it('should call handleVideoRequest for GET /video', () => {
    const req = {
      method: 'GET',
      url: 'video',
      headers: { host: 'localhost' },
    } as IncomingMessage;
    const res = {} as ServerResponse;

    routeRequest(req, res);

    expect(handleVideoRequest).toHaveBeenCalledWith(req, res);
  });

  it('should return 404 for unknown route', () => {
    const req = {
      method: 'GET',
      url: '/unknown',
      headers: { host: 'localhost' },
    } as IncomingMessage;
    const res = {} as ServerResponse;

    routeRequest(req, res);

    expect(sendResponse).toHaveBeenCalledWith(res, 404, 'Not Found');
  });
});
