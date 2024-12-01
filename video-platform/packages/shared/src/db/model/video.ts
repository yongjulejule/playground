import { Connection, Document, Model, Schema } from 'mongoose';

// 비디오 스키마 인터페이스
export interface IVideo extends Document {
  title: string;
  path: string;
  duration: number;
  size: number;
}

// 비디오 스키마 정의
const VideoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

// 비디오 모델 생성 함수 (다중 연결 지원)
export const createVideoModel = (connection: Connection): Model<IVideo> => {
  return connection.model<IVideo>('Video', VideoSchema);
};
