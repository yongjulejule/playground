import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [CatsService],
    }).compile();

    catsService = module.get<CatsService>(CatsService);
    catsController = module.get<CatsController>(CatsController);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result: Cat[] = [{ age: 2, breed: 'test', name: 'pipi' }];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);
      expect(await catsController.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a cat', async () => {
      const result: Cat = { age: 2, breed: 'test', name: 'pipi' };
      // let result: Cat;
      jest.spyOn(catsService, 'findOne').mockImplementation(() => result);
      expect(catsController.findOne(1)).toEqual(result);
    });
  });
});
