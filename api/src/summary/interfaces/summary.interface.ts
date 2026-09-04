import { ArticleSubtotal } from "./article-subtotal.interface.js";

export interface Summary {
    articles: ArticleSubtotal[];
    grandTotal: number;
}