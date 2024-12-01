import { Readable } from 'stream';

export const toReadable = (readableStream: ReadableStream): Readable => {
  const reader = readableStream.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null); // 스트림 끝
      } else {
        this.push(Buffer.from(value)); // 데이터를 Node.js 스트림으로 변환
      }
    },
  });
};
