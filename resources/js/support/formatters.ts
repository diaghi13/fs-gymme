/**
 * Global formatting utilities that use regional settings
 *
 * These functions automatically use the regional settings from the tenant configuration.
 * They are designed to be used in both React components (via hooks) and utility functions.
 */

import { RegionalSettings } from '@/types';

/**
 * Format a number according to regional settings
 */
export function formatNumber(
  value: number,
  settings: RegionalSettings,
  decimals: number = 2
): string {
  const parts = value.toFixed(decimals).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousands_separator);
  const decimalPart = parts[1];

  return decimals > 0
    ? `${integerPart}${settings.decimal_separator}${decimalPart}`
    : integerPart;
}

/**
 * Format a currency amount according to regional settings
 */
export function formatCurrency(
  value: number,
  settings: RegionalSettings,
  showSymbol: boolean = true
): string {
  const formatted = formatNumber(value, settings, 2);

  if (!showSymbol) {
    return formatted;
  }

  // Currency symbols
  const symbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    CHF: 'CHF',
    JPY: '¥',
  };

  const symbol = symbols[settings.currency] || settings.currency;

  // In Italy and most EU countries, symbol comes after the amount
  if (['EUR', 'CHF'].includes(settings.currency)) {
    return `${formatted} ${symbol}`;
  }

  // In US and UK, symbol comes before
  return `${symbol} ${formatted}`;
}

/**
 * Convert PHP date format to date-fns format
 */
export function phpToDateFnsFormat(phpFormat: string): string {
  const conversionMap: Record<string, string> = {
    // Day
    'd': 'dd',     // Day of month, 2 digits with leading zeros
    'D': 'EEE',    // Textual representation of a day, three letters
    'j': 'd',      // Day of month without leading zeros
    'l': 'EEEE',   // Full textual representation of the day of the week
    'N': 'i',      // ISO-8601 numeric representation of the day of the week
    'S': 'do',     // English ordinal suffix for the day of the month
    'w': 'e',      // Numeric representation of the day of the week
    'z': 'D',      // The day of the year

    // Month
    'm': 'MM',     // Numeric representation of a month, with leading zeros
    'M': 'MMM',    // Short textual representation of a month
    'n': 'M',      // Numeric representation of a month, without leading zeros
    'F': 'MMMM',   // Full textual representation of a month

    // Year
    'Y': 'yyyy',   // Full numeric representation of a year, 4 digits
    'y': 'yy',     // Two digit representation of a year

    // Time
    'H': 'HH',     // 24-hour format of an hour with leading zeros
    'h': 'hh',     // 12-hour format of an hour with leading zeros
    'i': 'mm',     // Minutes with leading zeros
    's': 'ss',     // Seconds with leading zeros
    'A': 'a',      // Uppercase AM or PM
  };

  let result = phpFormat;
  for (const [php, fns] of Object.entries(conversionMap)) {
    result = result.replace(new RegExp(php, 'g'), fns);
  }

  return result;
}
