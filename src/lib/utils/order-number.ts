import { format } from 'date-fns';

/**
 * Generate order number in format: ORD-YYYY-MMDD-NNN
 * Example: ORD-2026-0108-001
 */
export function generateOrderNumber(date: Date, sequence: number): string {
  const year = format(date, 'yyyy');
  const monthDay = format(date, 'MMdd');
  const seq = sequence.toString().padStart(3, '0');
  return `ORD-${year}-${monthDay}-${seq}`;
}

/**
 * Get the sequence number from an order number
 */
export function extractSequenceFromOrderNumber(orderNumber: string): number {
  const parts = orderNumber.split('-');
  if (parts.length === 4) {
    return parseInt(parts[3], 10);
  }
  return 0;
}

/**
 * Get today's order prefix (ORD-YYYY-MMDD)
 */
export function getTodayOrderPrefix(): string {
  const year = format(new Date(), 'yyyy');
  const monthDay = format(new Date(), 'MMdd');
  return `ORD-${year}-${monthDay}`;
}
