import type { QuantusObject } from '../types/object';

const UNIT_LABELS: Record<string, string> = {
  m: 'm',
  m2: 'm²',
  m3: 'm³',
  kg: 'kg',
  piece: 'piece',
};

export function formatUnit(unit: string): string {
  return UNIT_LABELS[unit] ?? unit;
}

export function formatQuantity(unit: QuantusObject['unit'], quantity: number): string {
  const rounded = quantity.toLocaleString(undefined, { maximumFractionDigits: 3 });
  return `${rounded} ${formatUnit(unit)}`;
}

export const UNIT_OPTIONS = ['m', 'm2', 'm3', 'kg', 'piece'] as const;

export const REQUIRED_PROPERTIES: Record<string, string[]> = {
  m: ['length'],
  m2: ['length', 'height'],
  m3: ['length', 'height', 'thickness'],
  kg: ['length', 'height', 'thickness', 'density'],
  piece: ['count'],
};
