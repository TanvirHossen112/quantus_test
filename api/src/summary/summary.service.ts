import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity.js';
import { ObjectEntity } from '../objects/entities/object.entity.js';
import { QuantityService } from '../objects/quantity.service.js';
import { Summary } from './interfaces/summary.interface.js';
import { ArticleSubtotal } from './interfaces/article-subtotal.interface.js';

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(ObjectEntity)
    private readonly objectsRepository: Repository<ObjectEntity>,
    private readonly quantityService: QuantityService,
  ) {}

  async getSummary(): Promise<Summary> {
    const [articles, objects] = await Promise.all([
      this.articlesRepository.find(),
      this.objectsRepository.find(),
    ]);

    const ownTotalByArticleId = new Map<string, number>();
    for (const object of objects) {
      const quantity = this.quantityService.calculate(
        object.unit,
        object.properties,
      );
      const lineTotalCents = Math.round(quantity * object.unitPriceCents);
      ownTotalByArticleId.set(
        object.articleId,
        (ownTotalByArticleId.get(object.articleId) ?? 0) + lineTotalCents,
      );
    }

    const childrenByParentId = new Map<string | null, Article[]>();
    for (const article of articles) {
      const key = article.parentId;
      const siblings = childrenByParentId.get(key) ?? [];
      siblings.push(article);
      childrenByParentId.set(key, siblings);
    }

    const subtotalOf = (article: Article): number => {
      const ownTotal = ownTotalByArticleId.get(article.id) ?? 0;
      const children = childrenByParentId.get(article.id) ?? [];
      const childrenTotal = children.reduce(
        (sum, child) => sum + subtotalOf(child),
        0,
      );
      return ownTotal + childrenTotal;
    };

    const topLevelArticles = childrenByParentId.get(null) ?? [];
    const articleSubtotals: ArticleSubtotal[] = topLevelArticles.map(
      (article) => ({
        id: article.id,
        code: article.code,
        title: article.title,
        subtotal: subtotalOf(article),
      }),
    );

    const grandTotal = articleSubtotals.reduce((sum, a) => sum + a.subtotal, 0);

    return { articles: articleSubtotals, grandTotal };
  }
}
