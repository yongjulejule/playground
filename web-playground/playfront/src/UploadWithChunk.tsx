import { useState } from 'react';
import { URL } from './constants';
import {
  CompleteMultipartUpload,
  GetMultipartPresignedUrl,
  GetMultipartUploadId,
  UploadChunk,
} from './APIs';

const CHUNK_COUNT = 6;
// const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB

const uploadOneChunk = async (
  url: string,
  key: string,
  chunk: Promise<ArrayBuffer>,
  partNumber: number,
  uploadId: string
) => {
  const result = await GetMultipartPresignedUrl(url, key, uploadId, partNumber);
  return await UploadChunk(result.presignedUrl, chunk, partNumber);
};

const uploadPackOfChunks = async (
  url: string,
  key: string,
  chunks: Promise<ArrayBuffer>[],
  partNumber: number,
  uploadId: string
) => {
  return await Promise.all(
    chunks.map(async (chunk, index) =>
      uploadOneChunk(url, key, chunk, partNumber + index, uploadId)
    )
  );
};

export function UploadWithChunk() {
  const [size, setSize] = useState(0);
  return (
    <div>
      <button
        onClick={async () => {
          const file = document.getElementById('file') as HTMLInputElement;
          const fileData = file.files?.[0];
          if (!fileData) {
            return alert('파일을 선택해주세요.');
          }
          setSize(fileData.size);
          const url = URL;
          const key = `test-${new Date().toISOString()}`;
          const { uploadId } = await GetMultipartUploadId(url, key);
          // const chunkCount = CHUNK_TOTAL_COUNT;
          const chunkSize = CHUNK_SIZE;
          const chunkTotalCount = Math.ceil(fileData.size / chunkSize);
          const prevTime = Date.now();
          const uploadResult = [];
          for (let i = 0; i < chunkTotalCount; i += CHUNK_COUNT) {
            const chunkArray = [];
            for (let j = 0; j < CHUNK_COUNT; j++) {
              if (i + j >= chunkTotalCount) {
                break;
              }
              const chunk = fileData
                .slice((i + j) * chunkSize, (i + j + 1) * chunkSize)
                .arrayBuffer();
              chunkArray.push(chunk);
            }
            uploadResult.push(
              await uploadPackOfChunks(url, key, chunkArray, i + 1, uploadId)
            );
          }

          CompleteMultipartUpload(url, uploadId, key, uploadResult.flat());
          alert(`소요시간: ${Date.now() - prevTime}ms`);
          setSize(0);
        }}
      >
        쪼개서 요청을 날려볼까? size : {size / 1000 / 1000}MB
      </button>
      <input type='file' id='file' />
    </div>
  );
}
