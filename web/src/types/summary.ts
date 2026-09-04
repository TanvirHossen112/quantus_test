export interface ArticleSubtotal {
  id: string;
  code: string;
  title: string;
  subtotal: number;
}

export interface Summary {
  articles: ArticleSubtotal[];
  grandTotal: number;
}
