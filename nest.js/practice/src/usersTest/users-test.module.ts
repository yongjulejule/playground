import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersTest } from './users-test.model';
import { UsersTestController } from './users-test.controller';
import { UsersTestService } from './users-test.service';

@Module({
  imports: [SequelizeModule.forFeature([UsersTest])],
  providers: [UsersTestService],
  controllers: [UsersTestController],
})
export class UsersTestModule {}
