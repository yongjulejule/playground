import {
  RabbitMqAdapter,
  VIDEO_VIEW_EXCHANGE_KEY,
} from '@video-platform/shared';
import { HistoryService } from '../history/service';

export const createVideoViewedSubscriber = (
  rabbitMqAdapter: RabbitMqAdapter,
  historyService: HistoryService
) => {
  return async () => {
    const exchange = await rabbitMqAdapter.exchange(
      VIDEO_VIEW_EXCHANGE_KEY,
      'fanout'
    );

    // "video-viewed" 이벤트 구독
    await rabbitMqAdapter.subscribe(
      exchange,
      'test',
      'viewed',
      async (message) => {
        console.info(
          'Processing message from "video-viewed" exchange:',
          message
        );

        const { videoId } = JSON.parse(message);
        await historyService.create(videoId, 'generated-user-id');
      }
    );

    console.info('VideoViewedSubscriber initialized successfully');
  };
};
