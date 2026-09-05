import { apiRequest } from "./client";
import type { ObjectFormPayload, QuantusObject } from "../types/object.js";

export const objectsApi = {
  list: (articleId: string) =>
    apiRequest<QuantusObject[]>(
      `/objects?articleId=${encodeURIComponent(articleId)}`,
    ),

  listAll: () => apiRequest<QuantusObject[]>("/objects"),

  get: (id: string) => apiRequest<QuantusObject>(`/objects/${id}`),

  create: (payload: ObjectFormPayload) =>
    apiRequest<QuantusObject>("/objects", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<ObjectFormPayload>) =>
    apiRequest<QuantusObject>(`/objects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    apiRequest<void>(`/objects/${id}`, { method: "DELETE" }),
};
