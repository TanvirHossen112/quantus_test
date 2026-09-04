import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectEntity } from './entities/object.entity.js';
import { ObjectsController } from './objects.controller.js';
import { ObjectsService } from './objects.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([ObjectEntity])],
  controllers: [ObjectsController],
  providers: [ObjectsService],
})
export class ObjectsModule {}
