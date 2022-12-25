import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from './config/config.service';

@Injectable()
export class AppService {
  private helloMessage: string;
  constructor(private sequelize: Sequelize, configService: ConfigService) {
    this.helloMessage = configService.get('CONFIG_MSG');
  }

  getHello(): string {
    return this.helloMessage;
  }
}
