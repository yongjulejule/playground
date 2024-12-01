import { Connection, Document, Model, Schema } from 'mongoose';

export interface IHistory extends Document {
  videoId: string;
  userId: string;
}

const HistorySchema = new Schema<IHistory>(
  {
    videoId: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

export const createHistoryModel = (connection: Connection): Model<IHistory> => {
  return connection.model<IHistory>('History', HistorySchema);
};
