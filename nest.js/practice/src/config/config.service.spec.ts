import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { CONFIG_OPTIONS } from './constants';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            folder: 'config',
          },
        },
        ConfigService,
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
