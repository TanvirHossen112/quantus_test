import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/entities/article.entity.js';
import { ObjectEntity } from '../objects/entities/object.entity.js';
import { QuantityService } from '../objects/quantity.service.js';
import { SummaryController } from './summary.controller.js';
import { SummaryService } from './summary.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Article, ObjectEntity])],
  controllers: [SummaryController],
  providers: [SummaryService, QuantityService],
})
export class SummaryModule { }
