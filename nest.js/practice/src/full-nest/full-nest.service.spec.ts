import { Test, TestingModule } from '@nestjs/testing';
import { FullNestService } from './full-nest.service';

describe('FullNestService', () => {
  let service: FullNestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FullNestService],
    }).compile();

    service = module.get<FullNestService>(FullNestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
