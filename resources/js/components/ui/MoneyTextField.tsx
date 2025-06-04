import * as React from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import { TextField, TextFieldProps } from '@mui/material';
import { FieldHookConfig, useField } from 'formik';

type MoneyTextFieldProps = {
  //label: string;
} & TextFieldProps & NumericFormatProps

const MoneyTextField : React.FC<MoneyTextFieldProps> = (props: TextFieldProps & FieldHookConfig<string>) => {
  const [field, meta, helper] = useField(props);

  const handleValueChange = ( event: React.ChangeEvent<HTMLInputElement>, ) => {
    const value = event?.target.value
      .replace(/\./g, '')
      .replace(/,/g, '.')
      .replace(/€/g, '');

    helper.setValue(value);
  }

  return (
    <NumericFormat
      {...field}
      customInput={TextField}
      thousandSeparator="."
      decimalSeparator=","
      valueIsNumericString
      prefix="€"
      variant="standard"
      onChange={handleValueChange}
      error={meta.touched && !!meta.error}
      helperText={meta.touched && meta.error}
      value={field.value ? parseFloat(field.value).toFixed(2) : ''}
      sx={{ width: '100%' }}
      {...props}
    />
 );
};

export default MoneyTextField
