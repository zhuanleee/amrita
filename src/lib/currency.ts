export function formatMYR(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}

export function parseMYR(formatted: string): number {
  return parseFloat(formatted.replace(/[^0-9.-]/g, ""));
}
