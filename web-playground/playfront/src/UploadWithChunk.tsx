import { useState } from 'react';
import { URL } from './constants';
import {
  CompleteMultipartUpload,
  GetMultipartPresignedUrl,
  GetMultipartUploadId,
  UploadChunk,
} from './APIs';

const CHUNK_COUNT = 12;
export function UploadWithChunk() {
  const [size, setSize] = useState(0);
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
          setSize(fileData.size);
          const url = URL;
          const key = `test-${new Date().toISOString()}`;
          const { uploadId } = await GetMultipartUploadId(url, key);
          const chunkCount = CHUNK_COUNT;
          const chunkSize = Math.ceil(fileData.size / chunkCount);
          const chunkArray = Array.from({ length: chunkCount }, (_, i) => i);
          const prevTime = Date.now();
          const chunkPromiseArray = await Promise.all(
            chunkArray.map((count) => {
              const chunk = fileData
                .slice(count * chunkSize, (count + 1) * chunkSize)
                .arrayBuffer()
                .then((chunkedData) =>
                  GetMultipartPresignedUrl(url, key, uploadId, count + 1).then(
                    (res) => ({
                      chunkedData,
                      presignedUrl: res.presignedUrl,
                    }),
                  ),
                )
                .then((res) =>
                  UploadChunk(res.presignedUrl, res.chunkedData, count + 1),
                );
              return chunk;
            }),
          );
          CompleteMultipartUpload(url, uploadId, key, chunkPromiseArray);
          alert(`소요시간: ${Date.now() - prevTime}ms`);
          setSize(0);
        }}
      >
        쪼개서 요청을 날려볼까? size : {size / 1000 / 1000}MB
      </button>
      <input type="file" id="file" />
    </div>
  );
}
