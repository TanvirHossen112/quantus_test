import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import sanitizeHtml from 'sanitize-html';
import type { Repository } from 'typeorm';
import { Article } from './entities/article.entity.js';
import { CreateArticleDto } from './dto/create-article.dto.js';
import { UpdateArticleDto } from './dto/update-article.dto.js';
import type { ArticleTreeNode } from './interfaces/article-tree-node.interface.js';

const DESCRIPTION_ALLOWED_TAGS = [
  'b',
  'strong',
  'i',
  'em',
  'u',
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'h3',
  'h4',
  'a',
];
const DESCRIPTION_ALLOWED_ATTRIBUTES = { a: ['href'] };
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
  ) {}

  async create(dto: CreateArticleDto): Promise<Article> {
    let parentId = dto.parentId ?? null;
    if (!parentId) {
      const parent = await this.findParentByCode(dto.code);
      parentId = parent?.id ?? null;
    }

    const article = this.articlesRepository.create({
      code: dto.code,
      title: dto.title,
      description: this.sanitizeDescription(dto.description),
      parentId,
    });

    try {
      return await this.articlesRepository.save(article);
    } catch (error) {
      throw this.mapWriteError(error);
    }
  }

  async findAll(tree: boolean): Promise<Article[] | ArticleTreeNode[]> {
    const articles = await this.articlesRepository.find({
      order: { code: 'ASC' },
    });
    return tree ? this.buildTree(articles) : articles;
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: { children: true, objects: true },
    });
    if (!article) {
      throw new NotFoundException(`Article ${id} not found`);
    }
    return article;
  }

  async update(id: string, dto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOne(id);

    if (dto.parentId !== undefined) {
      await this.assertNoCycle(id, dto.parentId ?? null);
      article.parentId = dto.parentId ?? null;
    }
    if (dto.code !== undefined) article.code = dto.code;
    if (dto.title !== undefined) article.title = dto.title;
    if (dto.description !== undefined) {
      article.description = this.sanitizeDescription(dto.description);
    }

    try {
      return await this.articlesRepository.save(article);
    } catch (error) {
      throw this.mapWriteError(error);
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    try {
      await this.articlesRepository.delete(id);
    } catch (error) {
      if (this.pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION) {
        throw new ConflictException(
          'Cannot delete: article still has child articles or objects. Delete or reassign them first.',
        );
      }
      throw error;
    }
  }

  private async assertNoCycle(
    articleId: string,
    newParentId: string | null,
  ): Promise<void> {
    if (newParentId === null) return;
    if (newParentId === articleId) {
      throw new BadRequestException('An article cannot be its own parent');
    }

    const result = await this.articlesRepository.query(
      `WITH RECURSIVE ancestors AS (
         SELECT id, parent_id FROM articles WHERE id = $1
         UNION ALL
         SELECT a.id, a.parent_id
         FROM articles a
         JOIN ancestors anc ON a.id = anc.parent_id
       )
       SELECT 1 FROM ancestors WHERE id = $2 LIMIT 1`,
      [newParentId, articleId],
    );

    if (result.length > 0) {
      throw new BadRequestException(
        'This would make the article a descendant of itself',
      );
    }
  }

  private buildTree(articles: Article[]): ArticleTreeNode[] {
    const nodes = new Map<string, ArticleTreeNode>(
      articles.map((article) => [article.id, { ...article, children: [] }]),
    );
    const roots: ArticleTreeNode[] = [];

    for (const node of nodes.values()) {
      if (node.parentId) {
        nodes.get(node.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  private async findParentByCode(code: string): Promise<Article | null> {
    const parentCode = this.extractParentCode(code);
    if (!parentCode) return null;

    return this.articlesRepository.findOne({
      where: [{ code: parentCode }, { code: `${parentCode}.` }],
    });
  }

  private extractParentCode(code: string): string | null {
    const parts = code.split('.').filter(Boolean);
    if (parts.length < 2) return null;

    return parts.slice(0, -1).join('.');
  }

  private sanitizeDescription(description?: string): string | null {
    if (description === undefined) return null;
    return sanitizeHtml(description, {
      allowedTags: DESCRIPTION_ALLOWED_TAGS,
      allowedAttributes: DESCRIPTION_ALLOWED_ATTRIBUTES,
    });
  }

  private mapWriteError(error: unknown): Error {
    const code = this.pgErrorCode(error);
    if (code === PG_UNIQUE_VIOLATION) {
      return new ConflictException('An article with this code already exists');
    }
    if (code === PG_FOREIGN_KEY_VIOLATION) {
      return new BadRequestException(
        'parentId does not reference an existing article',
      );
    }
    return error as Error;
  }

  private pgErrorCode(error: unknown): string | undefined {
    return (
      (error as { driverError?: { code?: string }; code?: string })?.driverError
        ?.code ?? (error as { code?: string })?.code
    );
  }
}
