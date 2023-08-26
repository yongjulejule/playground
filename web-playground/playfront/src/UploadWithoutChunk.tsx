import { useState } from 'react';
import { URL } from './constants';

const GetPresignedUrl = async (url: string, key: string) => {
  const res = await fetch(`${url}/s3/미리서명된-주소?key=${key}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:5173',
    },
  });
  return res.json();
};

const UploadFile = async (presignedUrl: string, file: File) => {
  return fetch(presignedUrl, {
    method: 'PUT',
    body: await file.arrayBuffer(),
  });
};

export function UploadWithoutChunk() {
  const [size, setSize] = useState(0);
  return (
    <div>
      <button
        onClick={async () => {
          const url = URL;
          const file = document.getElementById('file2') as HTMLInputElement;
          const fileData = file.files?.[0];
          setSize(fileData?.size || 0);
          if (!fileData) {
            alert('파일을 선택해주세요.');
            return;
          }
          const prevTime = Date.now();
          const { presignedUrl } = await GetPresignedUrl(url, fileData.name);
          await UploadFile(presignedUrl, fileData);
          alert(
            `업로드 완료. 용량: ${fileData.size / 1000}KB, 소요시간: ${
              Date.now() - prevTime
            }ms`,
          );
        }}
      >
        프리사인드로 요청을 날려볼까? size : {size / 1000 / 1000}MB
      </button>
      <input type="file" id="file2" />
    </div>
  );
}
