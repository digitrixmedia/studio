import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOrderNumber(orderNumber?: string | number) {
  if (!orderNumber) return '';
  if (typeof orderNumber === 'number') return `#${orderNumber}`;
  return orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;
}
export function generateTempOrderNumber(outletId: string) {
  return `TMP-${outletId}-${Date.now()}`;
}
