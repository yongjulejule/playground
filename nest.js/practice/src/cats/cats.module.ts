import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

// @Module() : decorator function that accepts a single metadata object
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
