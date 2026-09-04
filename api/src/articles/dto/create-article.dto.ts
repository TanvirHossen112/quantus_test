import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
