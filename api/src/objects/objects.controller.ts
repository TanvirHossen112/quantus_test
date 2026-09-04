import {
  Controller,
} from '@nestjs/common';
import { ObjectsService } from './objects.service.js';

@Controller('objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}
}
