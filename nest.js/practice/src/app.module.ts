import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { FullNestModule } from './full-nest/full-nest.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersTest } from './usersTest/users-test.model';
import { UsersTestModule } from './usersTest/users-test.module';
import { ConfigModule } from './config/config.module';
import { EventsModule } from './events/events.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    EventsModule,
    ConfigModule.register({ folder: './config' }),
    CatsModule,
    FullNestModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'jun',
      password: 'junjun',
      database: 'jun',
      autoLoadModels: true,
      synchronize: true,
      models: [UsersTest],
    }),
    UsersTestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
