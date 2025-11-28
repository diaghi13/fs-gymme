import { usePage } from '@inertiajs/react';
import { PageProps, RegionalSettings } from '@/types';

/**
 * Hook to access regional settings (localization) from anywhere in the app
 */
export function useRegionalSettings(): RegionalSettings {
  const { regional_settings } = usePage<PageProps>().props;

  // Return settings with fallback defaults
  return regional_settings ?? {
    language: 'it',
    timezone: 'Europe/Rome',
    date_format: 'd/m/Y',
    time_format: 'H:i',
    currency: 'EUR',
    decimal_separator: ',',
    thousands_separator: '.',
  };
}

/**
 * Format a number according to regional settings
 */
export function useFormatNumber() {
  const settings = useRegionalSettings();

  return (value: number, decimals: number = 2): string => {
    const parts = value.toFixed(decimals).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousands_separator);
    const decimalPart = parts[1];

    return decimals > 0
      ? `${integerPart}${settings.decimal_separator}${decimalPart}`
      : integerPart;
  };
}

/**
 * Format a currency amount according to regional settings
 */
export function useFormatCurrency() {
  const settings = useRegionalSettings();
  const formatNumber = useFormatNumber();

  return (value: number, showSymbol: boolean = true): string => {
    const formatted = formatNumber(value, 2);

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
  };
}

/**
 * Convert PHP date format to date-fns format
 */
function phpToDateFnsFormat(phpFormat: string): string {
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

  // Create regex pattern that matches all PHP format characters
  // Use negative lookbehind to avoid matching already replaced patterns
  const pattern = Object.keys(conversionMap).join('|');
  const regex = new RegExp(pattern, 'g');

  // Replace all matches in a single pass to avoid overlapping replacements
  return phpFormat.replace(regex, (match) => conversionMap[match] || match);
}

/**
 * Get date format for date-fns
 */
export function useDateFormat(): string {
  const settings = useRegionalSettings();
  return phpToDateFnsFormat(settings.date_format);
}

/**
 * Get date-time format for date-fns
 */
export function useDateTimeFormat(): string {
  const settings = useRegionalSettings();
  const dateFormat = phpToDateFnsFormat(settings.date_format);
  const timeFormat = phpToDateFnsFormat(settings.time_format);
  return `${dateFormat} ${timeFormat}`;
}
