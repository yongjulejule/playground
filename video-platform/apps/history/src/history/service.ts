import { RabbitMqAdapter } from '@video-platform/shared';
import { createHistoryRepository } from './repository';

export const createHistoryService = (
  repository: ReturnType<typeof createHistoryRepository>,
  rabbitMqAdapter: RabbitMqAdapter
) => {
  return {
    // 비즈니스 로직: history 생성
    create: async (videoId: string, userId: string) => {
      return repository.create({ videoId, userId });
    },

    // 비즈니스 로직: 모든 비디오 조회
    findMany: async () => {
      return repository.findAll();
    },
  };
};

export type HistoryService = ReturnType<typeof createHistoryService>;
