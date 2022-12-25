import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { ValidationPipe } from './validation/validation.pipe';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('cats')
@UseGuards(RolesGuard)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create cat' })
  @ApiResponse({ status: 201, description: 'create.', type: CreateCatDto })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Body(new ValidationPipe()) createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<CreateCatDto[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateCatDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): CreateCatDto {
    return this.catsService.findOne(id);
  }
}
