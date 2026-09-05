import { apiRequest } from "./client";
import type { Summary } from "../types/summary";

export const summaryApi = {
  get: () => apiRequest<Summary>("/summary"),
};
