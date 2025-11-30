import * as React from 'react';
import { format } from 'date-fns';
import { useDateFormat, useDateTimeFormat } from '@/hooks/useRegionalSettings';

interface FormattedDateProps {
  value: Date | string | number;
  showTime?: boolean;
}

/**
 * Component to display a formatted date according to regional settings
 */
export const FormattedDate: React.FC<FormattedDateProps> = ({
  value,
  showTime = false
}) => {
  const dateFormat = useDateFormat();
  const dateTimeFormat = useDateTimeFormat();

  const date = typeof value === 'string' || typeof value === 'number'
    ? new Date(value)
    : value;

  const formatted = format(date, showTime ? dateTimeFormat : dateFormat);

  return <>{formatted}</>;
};

export default FormattedDate;
