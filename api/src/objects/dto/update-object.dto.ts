import { PartialType } from '@nestjs/mapped-types';
import { CreateObjectDto } from './create-object.dto.js';

export class UpdateObjectDto extends PartialType(CreateObjectDto) {}
