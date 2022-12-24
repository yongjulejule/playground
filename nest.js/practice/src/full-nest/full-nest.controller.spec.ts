import { Test, TestingModule } from '@nestjs/testing';
import { FullNestController } from './full-nest.controller';
import { FullNestService } from './full-nest.service';

describe('FullNestController', () => {
  let controller: FullNestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FullNestController],
      providers: [FullNestService],
    }).compile();

    controller = module.get<FullNestController>(FullNestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
