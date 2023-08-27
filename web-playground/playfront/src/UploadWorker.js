import { GetMultipartPresignedUrl, UploadChunk } from './APIs';
import { URL } from './constants';

self.onmessage = async (e) => {
  const { key, chunkArray, chunkSize, fileData, uploadId } = e.data;
  const url = URL;
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
  self.postMessage(chunkPromiseArray);
};
