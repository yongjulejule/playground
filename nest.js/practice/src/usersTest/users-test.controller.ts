import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { LoggingInterceptor } from 'src/logging.interceptor';
import { CreateUsersTestDto } from './dto/create-users-test.dto';
import { UsersTestService } from './users-test.service';

@Controller('users-test')
@UseInterceptors(LoggingInterceptor)
export class UsersTestController {
  constructor(private usersTestService: UsersTestService) {}

  @Post()
  create(@Body() createUsersTestDto: CreateUsersTestDto) {
    return this.usersTestService.create(createUsersTestDto);
  }

  @Get()
  findAll() {
    return this.usersTestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersTestService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersTestService.remove(id);
  }
}
