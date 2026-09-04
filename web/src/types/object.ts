export interface QuantusObject {
  id: string;
  drawingUuid: string;
  name: string;
  type: string;
  unit: string;
  unitPriceCents: number;
  properties: Record<string, number | undefined>;
  articleId: string;
  createdAt: string;
  updatedAt: string;
  quantity: number;
  lineTotalCents: number;
}

export interface ObjectFormPayload {
  drawingUuid: string;
  name: string;
  type: string;
  unit: string;
  unitPriceCents: number;
  properties: Record<string, number | undefined>;
  articleId: string;
}
