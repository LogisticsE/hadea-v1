import { addDays, isWeekend, nextMonday, format, parseISO } from 'date-fns';

/**
 * Calculate outbound ship date from sampling date
 * Rule: 14 days before sampling date
 * If the result falls on weekend, move to next Monday
 */
export function calculateOutboundShipDate(samplingDate: Date): Date {
  // Go back 14 days
  let outboundDate = addDays(samplingDate, -14);
  
  // If it's a weekend, move to next Monday
  if (isWeekend(outboundDate)) {
    outboundDate = nextMonday(outboundDate);
  }
  
  return outboundDate;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'PPP p');
}

/**
 * Check if a date is in the past
 */
export function isDateInPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj < new Date();
}

/**
 * Get ISO date string (YYYY-MM-DD)
 */
export function getISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
