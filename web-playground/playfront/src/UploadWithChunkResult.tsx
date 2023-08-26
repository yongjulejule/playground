import { useState } from 'react';
import { URL } from './constants';

const getPresignedUrl = (url: string, key: string) => {
  return fetch(`${url}/getPresignedUrl?key=${key}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());
};

const getVideo = (url: string, key: string) => {
  return fetch(`${url}/getVideo?key=${key}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());
};

export function UploadWithChunkResult() {
  const [asset, setAsset] = useState<any>(null);
  return (
    <div>
      <button
        onClick={async () => {
          const url = URL;
          const key = (document.getElementById('key1') as HTMLInputElement)
            .value;
          const { presignedUrl } = await getPresignedUrl(url, key);
          const data = await getVideo(presignedUrl, key);
          setAsset(data);
        }}
      >
        ㄱㄱ
      </button>
      <input type="search" id="key1" />
      {asset && (
        <video controls>
          <source src={asset.url} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
