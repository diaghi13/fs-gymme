/**
 * Date formatting utilities
 *
 * NOTE: These functions use hardcoded formats for backward compatibility.
 * For new code, use the hooks from @/hooks/useRegionalSettings instead:
 *
 * - useDateFormat() - Get format from regional settings
 * - useDateTimeFormat() - Get date+time format from regional settings
 * - useFormatCurrency() - Format currency with regional settings
 * - useFormatNumber() - Format numbers with regional settings
 *
 * Or use the components:
 * - <FormattedDate value={date} /> - Auto-formatted date
 * - <FormattedCurrency value={amount} /> - Auto-formatted currency
 * - <FormattedNumber value={number} /> - Auto-formatted number
 */

import { format as fnsFormat, FormatOptions } from 'date-fns';

/**
 * Format a date with a specific format string
 * @deprecated Use useDateFormat() hook or <FormattedDate> component instead
 */
export default function format(
  date: string | number | Date,
  formatStr: string,
  options?: FormatOptions
) {
  if (typeof date === 'string' || typeof date === 'number') {
    return fnsFormat(new Date(date), formatStr, options);
  }

  return fnsFormat(date, formatStr, options);
}

/**
 * Format date in Italian format (dd/MM/yyyy)
 * @deprecated Use useDateFormat() hook or <FormattedDate> component instead
 */
export function itNumberForma(date: string | number | Date, options?: FormatOptions) {
  return format(date, 'dd/MM/yyyy', options);
}

/**
 * Format date in Italian format (dd/mm/y)
 * @deprecated Use useDateFormat() hook or <FormattedDate> component instead
 */
export function itStringForma(date: string | number | Date, options?: FormatOptions) {
  return format(date, 'dd/mm/y', options);
}
