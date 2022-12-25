import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../config/config.service';
import { CONFIG_OPTIONS } from '../config/constants';
import { FullNestController } from './full-nest.controller';
import { FullNestService } from './full-nest.service';

describe('FullNestController', () => {
  let controller: FullNestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FullNestController],
      providers: [
        FullNestService,
        ConfigService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { folder: 'config' },
        },
      ],
    }).compile();

    controller = module.get<FullNestController>(FullNestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
