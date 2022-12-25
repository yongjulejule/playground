/* Providers : Providers are a fundamental concept in Nest. 
		Many of the basic Nest classes may be treated as a provider
		– services, repositories, factories, helpers, and so on.
		The main idea of a provider is that it can be injected as a dependency; 
		this means objects can create various relationships with each other, 
		and the function of "wiring up" instances of objects can largely
		be delegated to the Nest runtime system. */
import { Injectable } from '@nestjs/common';
import { CreateFullNestDto } from './dto/create-full-nest.dto';
import { UpdateFullNestDto } from './dto/update-full-nest.dto';
import { ConfigService } from '../config/config.service';

/*  @Injectable() : attaches metadata, which declares that FullNestService is 
		a class that can be managed by the Nest IoC(Inversion of Control) container */
@Injectable()
export class FullNestService {
  private configMsg: string;
  constructor(configService: ConfigService) {
    this.configMsg = configService.get('CONFIG_MSG');
  }

  getHello(): string {
    return this.configMsg;
  }

  create(createFullNestDto: CreateFullNestDto) {
    return 'This action adds a new fullNest';
  }

  findAll() {
    return `This action returns all fullNest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fullNest`;
  }

  update(id: number, updateFullNestDto: UpdateFullNestDto) {
    return `This action updates a #${id} fullNest`;
  }

  remove(id: number) {
    return `This action removes a #${id} fullNest`;
  }
}
