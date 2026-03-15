import type { MalaysianState } from "./types";

const SHIPPING_RATES: Record<string, number> = {
  // Klang Valley - flat rate
  "Kuala Lumpur": 8,
  Selangor: 8,
  Putrajaya: 8,
  // Peninsular Malaysia
  Johor: 10,
  Kedah: 10,
  Kelantan: 10,
  Melaka: 10,
  "Negeri Sembilan": 10,
  Pahang: 10,
  Penang: 10,
  Perak: 10,
  Perlis: 10,
  Terengganu: 10,
  // East Malaysia
  Sabah: 15,
  Sarawak: 15,
  Labuan: 15,
};

const FREE_SHIPPING_THRESHOLD = 50;

export function getShippingFee(state: MalaysianState, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_RATES[state] ?? 12;
}

export function getFreeShippingProgress(subtotal: number): {
  remaining: number;
  percentage: number;
  isFree: boolean;
} {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  return {
    remaining,
    percentage: Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100),
    isFree: subtotal >= FREE_SHIPPING_THRESHOLD,
  };
}

export { FREE_SHIPPING_THRESHOLD };
