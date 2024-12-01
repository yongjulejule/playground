import { createHistoryModel, IHistory } from '@video-platform/shared';
import { Connection } from 'mongoose';

export const createHistoryRepository = (connection: Connection) => {
  const historyModel = createHistoryModel(connection);

  return {
    create: async (data: Partial<IHistory>): Promise<IHistory> => {
      const history = new historyModel(data);
      return history.save();
    },

    findAll: async (): Promise<IHistory[]> => {
      return historyModel.find().exec();
    },

    findById: async (id: string): Promise<IHistory | null> => {
      return historyModel.findById(id).exec();
    },

    deleteById: async (id: string): Promise<IHistory | null> => {
      return historyModel.findByIdAndDelete(id).exec();
    },
  };
};
