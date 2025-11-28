import * as React from 'react';
import { useFormatNumber } from '@/hooks/useRegionalSettings';

interface FormattedNumberProps {
  value: number;
  decimals?: number;
}

/**
 * Component to display a formatted number according to regional settings
 */
export const FormattedNumber: React.FC<FormattedNumberProps> = ({
  value,
  decimals = 2
}) => {
  const formatNumber = useFormatNumber();
  return <>{formatNumber(value, decimals)}</>;
};

export default FormattedNumber;
