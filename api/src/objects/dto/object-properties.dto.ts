import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class ObjectPropertiesDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  length?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  height?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  thickness?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  density?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  count?: number;
}
