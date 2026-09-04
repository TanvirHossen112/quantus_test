import { ObjectEntity } from "../entities/object.entity.js";

export interface ObjectResponse extends ObjectEntity {
    quantity: number;
    lineTotalCents: number;
  }
  