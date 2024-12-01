import { createVideoModel, IVideo } from '@video-platform/shared';
import { Connection } from 'mongoose';

export const createVideoRepository = (connection: Connection) => {
  const videoModel = createVideoModel(connection);

  return {
    create: async (
      title: string,
      path: string,
      duration: number,
      size: number
    ): Promise<IVideo> => {
      const video = new videoModel({ title, path, duration, size });
      return video.save();
    },

    findAll: async (): Promise<IVideo[]> => {
      return videoModel.find().exec();
    },

    findById: async (id: string): Promise<IVideo | null> => {
      return videoModel.findById(id).exec();
    },

    deleteById: async (id: string): Promise<IVideo | null> => {
      return videoModel.findByIdAndDelete(id).exec();
    },
  };
};
