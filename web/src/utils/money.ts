export function formatCents(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export function parseEurosToCents(euros: number): number {
  return Math.round(euros * 100);
}
