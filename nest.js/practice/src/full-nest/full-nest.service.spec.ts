import { Test, TestingModule } from '@nestjs/testing';
import { FullNestService } from './full-nest.service';
import { ConfigService } from '../config/config.service';
import { CONFIG_OPTIONS } from '../config/constants';

describe('FullNestService', () => {
  let service: FullNestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FullNestService,
        ConfigService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { folder: 'config' },
        },
      ],
    }).compile();

    service = module.get<FullNestService>(FullNestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
