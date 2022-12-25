import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UsersTest } from './users-test.model';
import { CreateUsersTestDto } from './dto/create-users-test.dto';

@Injectable()
export class UsersTestService {
  constructor(
    @InjectModel(UsersTest)
    private usersTestModel: typeof UsersTest,
  ) {}

  async findAll(): Promise<UsersTest[]> {
    return this.usersTestModel.findAll();
  }

  async create(createUsersTestDto: CreateUsersTestDto): Promise<UsersTest> {
    return this.usersTestModel.create({
      firstName: createUsersTestDto.firstName,
      lastName: createUsersTestDto.lastName,
    });
  }

  async findOne(id: string): Promise<UsersTest | null> {
    return this.usersTestModel.findOne({
      where: { id },
    });
  }

  async remove(id: string): Promise<void> {
    const usersTest = await this.findOne(id);
    await usersTest?.destroy();
  }
}
