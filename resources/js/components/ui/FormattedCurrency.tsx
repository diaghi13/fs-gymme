import * as React from 'react';
import { useFormatCurrency } from '@/hooks/useRegionalSettings';

interface FormattedCurrencyProps {
  value: number;
  showSymbol?: boolean;
}

/**
 * Component to display a formatted currency amount according to regional settings
 */
export const FormattedCurrency: React.FC<FormattedCurrencyProps> = ({
  value,
  showSymbol = true
}) => {
  const formatCurrency = useFormatCurrency();
  return <>{formatCurrency(value, showSymbol)}</>;
};

export default FormattedCurrency;
