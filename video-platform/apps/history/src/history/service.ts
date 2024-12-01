import { RabbitMqAdapter } from '@video-platform/shared';
import { createHistoryRepository } from './repository';

export const createHistoryService = (
  repository: ReturnType<typeof createHistoryRepository>,
  rabbitMqAdapter: RabbitMqAdapter
) => {
  return {
    // 비즈니스 로직: history 생성
    create: async (video: {
      title: string;
      path: string;
      duration: number;
      size: number;
    }) => {
      const { title, path, duration, size } = video;
      // 비즈니스 검증 로직 추가 가능
      if (duration <= 0 || size <= 0) {
        throw new Error('Invalid video duration or size');
      }
      return repository.create(title, path, duration, size);
    },

    // 비즈니스 로직: 모든 비디오 조회
    findMany: async () => {
      return repository.findAll();
    },
  };
};

export type VideoHistory = ReturnType<typeof createHistoryService>;
