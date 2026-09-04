import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { ArticlesModule } from './articles/articles.module.js';
import { ObjectsModule } from './objects/objects.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? '',
      appSecret: process.env.OBSERVE_APP_SECRET ?? '',
      serviceId: 'nest-typescript-starter',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') ?? 'localhost',
        port: Number(configService.get('DB_PORT') ?? 5432),
        username: configService.get('DB_USER') ?? 'quantus',
        password: configService.get('DB_PASSWORD') ?? 'quantusdevsecret__',
        database: configService.get('DB_NAME') ?? 'quantus',
        entities: [],
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: true,
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      }),
    }),
    ArticlesModule,
    ObjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
