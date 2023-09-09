export interface UploadIdDto {
  uploadId: string;
  completeUrl: string;
}

export interface PresignedUrlDto {
  presignedUrl: string;
}

export interface UploadChunkDto {
  eTag: string;
  partNumber: number;
}

export const GetMultipartUploadId = async (
  url: string,
  key: string
): Promise<UploadIdDto> => {
  const res = await fetch(`${url}/s3/멀티파트/업로드-아이디?key=${key}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return await res.json();
};

export const GetMultipartPresignedUrl = async (
  url: string,
  key: string,
  uploadId: string,
  part: number
): Promise<PresignedUrlDto> => {
  console.log('get parts: ', part);
  const res = await fetch(
    `${url}/s3/멀티파트/미리서명된-주소?key=${key}&uploadId=${uploadId}&part=${part}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return await res.json();
};

export const UploadChunk = async (
  presignedUrl: string,
  chunk: Promise<ArrayBuffer>,
  partNumber: number
): Promise<UploadChunkDto> => {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    body: await chunk,
  });
  return { eTag: res.headers.get('ETag')!, partNumber: partNumber };
};

export const CompleteMultipartUpload = async (
  url: string,
  uploadId: string,
  key: string,
  parts: UploadChunkDto[]
) => {
  const res = await fetch(`${url}/s3/멀티파트/업로드-완`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parts: parts, uploadId, key }),
    mode: 'cors',
  });
  return res.status;
};
