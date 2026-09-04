import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Post,
  Body,
} from '@nestjs/common';
import { ObjectsService } from './objects.service.js';
import { CreateObjectDto } from './dto/create-object.dto.js';
import { UpdateObjectDto } from './dto/update-object.dto.js';

@Controller('objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  @Post()
  create(@Body() dto: CreateObjectDto) {
    return this.objectsService.create(dto);
  }

  @Get()
  findAll(@Query('articleId') articleId?: string) {
    return this.objectsService.findAll(articleId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.objectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateObjectDto) {
    return this.objectsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.objectsService.remove(id);
  }
}
