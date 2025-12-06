import * as React from 'react';
import { NumericFormat } from 'react-number-format';
import { Stack, TextField as MuiTextField } from '@mui/material';
import MoneyTextField from '@/components/ui/MoneyTextField';
import { useSaleContext } from '@/contexts/Sale/SaleContext';
import { useFormikContext } from 'formik';
import { SaleFormValues } from '@/pages/sales/sales';

interface SaleDiscountsProps {
  handlePercentageDiscountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAbsoluteDiscountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SaleDiscounts: React.FC<SaleDiscountsProps> = ({ handleAbsoluteDiscountChange, handlePercentageDiscountChange }) => {
  const { sale_price, total_price } = useSaleContext();
  const { values, setFieldValue } = useFormikContext<SaleFormValues>();

  // Per il campo sconto percentuale
  const handleDiscountPercentageBlur = () => {
    const discount = (values.discount_percentage / 100) * sale_price;
    if (Math.abs(values.discount_absolute - discount) > 0.01) {
      setFieldValue('discount_absolute', discount);
    }
    if (values.discount_percentage === 0 && values.discount_absolute !== 0) {
      setFieldValue('discount_absolute', 0);
    }
  };

// Per il campo sconto assoluto
  const handleDiscountAbsoluteBlur = () => {
    const percentage = (values.discount_absolute / sale_price) * 100;
    if (Math.abs(values.discount_percentage - percentage) > 0.01) {
      setFieldValue('discount_percentage', percentage);
    }
    if (values.discount_absolute === 0 && values.discount_percentage !== 0) {
      setFieldValue('discount_percentage', 0);
    }
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{ marginBottom: 4 }}
      spacing={2}
    >
      <NumericFormat
        customInput={MuiTextField}
        label="Prezzo vendita"
        value={sale_price.toFixed(2)}
        disabled
        variant="standard"
        sx={{ width: '100%' }}
        thousandSeparator="."
        decimalSeparator=","
        valueIsNumericString
        prefix="€"
      />
      <MoneyTextField
        label="Sconto %"
        name={'discount_percentage'}
        prefix={undefined}
        //onChange={handlePercentageDiscountChange}
        onBlur={handleDiscountPercentageBlur}
      />
      <MoneyTextField
        label="Sconto assoluto"
        name={'discount_absolute'}
        prefix={undefined}
        //onChange={handleAbsoluteDiscountChange}
        onBlur={handleDiscountAbsoluteBlur}
      />
      <NumericFormat
        customInput={MuiTextField}
        label="Prezzo vendita"
        value={total_price.toFixed(2)}
        disabled
        variant="standard"
        sx={{ width: '100%' }}
        thousandSeparator="."
        decimalSeparator=","
        valueIsNumericString
        prefix="€"
      />
    </Stack>
  );
};

export default SaleDiscounts;
