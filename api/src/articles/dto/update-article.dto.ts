import { IsOptional, IsUUID } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto.js';

export class UpdateArticleDto extends PartialType(
  OmitType(CreateArticleDto, ['parentId'] as const),
) {
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
