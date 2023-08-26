import { useState } from 'react';
import { URL } from './constants';

interface UploadIdDto {
  uploadId: string;
  completeUrl: string;
}

const GetMultipartUploadId = async (
  url: string,
  key: string,
): Promise<UploadIdDto> => {
  const res = await fetch(`${url}/s3/멀티파트/업로드-아이디?key=${key}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return await res.json();
};

const ChunkData = async (
  data: Promise<ArrayBuffer>,
  count: number,
  chunkSize: number,
): Promise<ArrayBuffer> => {
  const buffer = await data;
  return buffer.slice(count * chunkSize, (count + 1) * chunkSize);
};

interface PresignedUrlDto {
  presignedUrl: string;
}

const GetMultipartPresignedUrl = async (
  url: string,
  key: string,
  uploadId: string,
  part: number,
): Promise<PresignedUrlDto> => {
  console.log('get parts: ', part);
  const res = await fetch(
    `${url}/s3/멀티파트/미리서명된-주소?key=${key}&uploadId=${uploadId}&part=${part}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return await res.json();
};

interface UploadChunkDto {
  eTag: string;
  partNumber: number;
}

const UploadChunk = async (
  presignedUrl: string,
  chunk: ArrayBuffer,
  partNumber: number,
): Promise<UploadChunkDto> => {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    body: chunk,
  });

  return { eTag: res.headers.get('ETag')!, partNumber: partNumber };
};

const completeXmlBuilder = (parts: UploadChunkDto[]) => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?><CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">`;
  parts.forEach((part) => {
    xml += `<Part><ETag>${part.eTag}</ETag><PartNumber>${part.partNumber}</PartNumber></Part>`;
  });
  xml += `</CompleteMultipartUpload>`;
  return xml;
};

const CompleteMultipartUpload = async (
  presignedUrl: string,
  uploadId: string,
  key: string,
  parts: UploadChunkDto[],
) => {
  const res = await fetch(`${URL}/s3/멀티파트/업로드-완`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parts: parts, uploadId, key }),
    mode: 'cors',
  });
  return res.status;
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
            alert('파일을 선택해주세요.');
            return;
          }
          setSize(file.size);
          const url = URL;
          const key = 'test-name.mp4';
          const { uploadId, completeUrl } = await GetMultipartUploadId(
            url,
            key,
          );
          const chunkSize = 100 * 1024 * 1024;
          const chunkCount = Math.ceil(fileData.size / chunkSize);
          const chunkArray = Array.from({ length: chunkCount }, (_, i) => i);
          const chunkPromiseArray = await Promise.all(
            chunkArray.map((count) => {
              const chunk = ChunkData(fileData.arrayBuffer(), count, chunkSize)
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
          CompleteMultipartUpload(
            completeUrl,
            uploadId,
            key,
            chunkPromiseArray,
          );
          alert('업로드 완료');
          setSize(0);
        }}
      >
        쪼개서 요청을 날려볼까? size : {size / 1000 / 1000}MB
      </button>
      <input type="file" id="file" />
    </div>
  );
}
