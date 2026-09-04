import { Article } from "../entities/article.entity.js";

export interface ArticleTreeNode extends Article {
    children: ArticleTreeNode[];
  }