import { Readable } from 'stream';
import { URL } from 'url';
import { debugAction } from '../utils';
import { toReadable } from '../utils/to-readable';

export const createMinIOAdapter = (
  baseURL: string,
  accessKey: string,
  secretKey: string
) => {
  const buildUrl = (path: string) => new URL(path, baseURL).toString();

  return {
    // MinIO 파일 존재 여부 확인
    exists: async (
      bucketName: string,
      objectName: string
    ): Promise<boolean> => {
      const url = buildUrl(`/${bucketName}/${objectName}`);
      debugAction(() => console.info(`Checking file existence: ${url}`));
      try {
        const response = await fetch(url, { method: 'HEAD' });
        debugAction(() => console.info(`File exists: ${response.status}`));

        if (response.ok) {
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to check file existence:', error);
        throw new Error('Failed to check file existence');
      }
    },

    // MinIO에서 파일 스트림 가져오기
    getStream: async (
      bucketName: string,
      objectName: string
    ): Promise<Readable> => {
      try {
        const url = buildUrl(`/${bucketName}/${objectName}`);
        debugAction(() => console.info(`Fetching file: ${url}`));
        const response = await fetch(url, { method: 'GET' });
        debugAction(() => console.info(`File fetched: ${response}`));

        if (!response.ok || !response.body) {
          throw new Error(`Failed to fetch file. Status: ${response.status}`);
        }

        // `body`는 ReadableStream으로 반환되므로 Node.js에서 사용 가능
        return toReadable(response.body);
      } catch (error) {
        console.error('Failed to get file stream:', error);
        throw new Error('Failed to get file stream');
      }
    },
  };
};

export type MinIOAdapter = ReturnType<typeof createMinIOAdapter>;
export interface VideoStorageAdapter extends MinIOAdapter {}
