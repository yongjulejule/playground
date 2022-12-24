import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Header,
  Redirect,
  Query,
  Param,
  Body,
  ParseIntPipe,
  UsePipes,
} from '@nestjs/common';

import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { CatsService } from './cats.service';
import { ValidationPipe } from './validation/validation.pipe';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body(new ValidationPipe()) createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<CreateCatDto[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CreateCatDto> {
    return this.catsService.findOne(id);
  }
}
