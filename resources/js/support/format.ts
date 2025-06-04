import { format as fnsFormat, FormatOptions } from 'date-fns';

export default function format (
  date: string | number | Date,
  format: string,
  options?: FormatOptions
) {
  if (typeof date === "string" || typeof date === "number") {
    return fnsFormat(new Date(date), format, options);
  }

  return fnsFormat(date, format, options);
}

export function itNumberForma(date: string | number | Date, options?: FormatOptions) {
  return format(date, "dd/MM/yyyy", options);
}

export function itStringForma(date: string | number | Date, options?: FormatOptions) {
  return format(date, 'dd/mm/y', options);
}
