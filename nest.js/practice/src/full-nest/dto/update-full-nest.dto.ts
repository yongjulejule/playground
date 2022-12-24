import { PartialType } from '@nestjs/mapped-types';
import { CreateFullNestDto } from './create-full-nest.dto';

export class UpdateFullNestDto extends PartialType(CreateFullNestDto) {}
