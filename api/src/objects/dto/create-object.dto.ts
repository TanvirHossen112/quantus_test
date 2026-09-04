import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Unit } from '../enums/unit.enum.js';
import { ObjectPropertiesDto } from './object-properties.dto.js';

export class CreateObjectDto {
  @IsUUID()
  drawingUuid: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsEnum(Unit)
  unit: Unit;

  @IsInt()
  @Min(0)
  unitPriceCents: number;

  @ValidateNested()
  @Type(() => ObjectPropertiesDto)
  properties: ObjectPropertiesDto;

  @IsUUID()
  articleId: string;
}
