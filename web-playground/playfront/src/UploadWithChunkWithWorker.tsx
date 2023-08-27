import {
  CompleteMultipartUpload,
  GetMultipartUploadId,
  UploadChunkDto,
} from './APIs';
import { URL as url } from './constants';

const CHUNK_COUNT = 6;
export function UploadWithChunkWithWorker() {
  // new Worker()
  return (
    <div>
      <button
        onClick={async () => {
          const file = document.getElementById('file') as HTMLInputElement;
          const fileData = file.files?.[0];
          if (!fileData) {
            alert('파일을 선택해주세요.');
            return;
          }
          const key = `test-${new Date().toISOString()}`;
          const chunkCount = CHUNK_COUNT;
          const chunkSize = Math.ceil(fileData.size / chunkCount);
          const prev = Date.now();
          const { uploadId } = await GetMultipartUploadId(url, key);
          const chunkArray = Array.from({ length: chunkCount }, (_, i) => i);
          const workers = [
            new Worker(
              new URL('/src/UploadWorker.js', 'http://localhost:5173'),
              { type: 'module' },
            ),
            new Worker(
              new URL('/src/UploadWorker.js', 'http://localhost:5173'),
              { type: 'module' },
            ),
          ];

          const promises: Array<Promise<UploadChunkDto>> = [];
          workers.forEach((worker, index) => {
            worker.postMessage({
              key,
              chunkArray: chunkArray.slice(index * 3, (index + 1) * 3),
              chunkSize,
              fileData,
              uploadId,
            });
            worker.onmessage = async (e) => {
              promises.push(
                new Promise((resolve) => {
                  worker.terminate();
                  resolve(e.data);
                }),
              );
              if (promises.length === 2) {
                const resultArray = await Promise.all(promises);
                CompleteMultipartUpload(url, uploadId, key, resultArray.flat());
                alert(`소요시간: ${Date.now() - prev}ms`);
              }
            };
          });
        }}
      >
        쓰레드야 놀지말고 일하렴
      </button>
      <input type="file" id="file" />
    </div>
  );
}
