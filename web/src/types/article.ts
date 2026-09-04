export interface Article {
  id: string;
  code: string;
  title: string;
  description: string | null;
  parentId: string | null;
  children?: Article[];
  createdAt: string;
  updatedAt: string;
}

export interface ArticleFormPayload {
  code: string;
  title: string;
  description?: string;
  parentId?: string | null;
}
