import { Module, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '../../src/app.controller.js';
import { AppService } from '../../src/app.service.js';
import { ArticlesModule } from '../../src/articles/articles.module.js';
import { ObjectsModule } from '../../src/objects/objects.module.js';
import { SummaryModule } from '../../src/summary/summary.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'quantus',
      password: process.env.DB_PASSWORD ?? 'quantusdevsecret__',
      database: process.env.DB_NAME ?? 'quantus',
      autoLoadEntities: true,
      synchronize: false,
    }),
    ArticlesModule,
    ObjectsModule,
    SummaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
class TestAppModule {}

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [TestAppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}
