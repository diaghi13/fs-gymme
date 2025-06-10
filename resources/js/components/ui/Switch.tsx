import * as React from 'react';
import { Switch as MuiSwitch, SwitchProps as MuiSwitchProps } from '@mui/material';
import { FieldHookConfig, useField } from 'formik';
import { FormControlLabel } from '@mui/material';

export type SwitchProps = {
  label?: string;
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
} & MuiSwitchProps & FieldHookConfig<boolean>;

const Switch: React.FC<SwitchProps> = (props: SwitchProps) => {
  const [field, meta, helpers] = useField({ ...props, type: 'switch' });

  return (
    <FormControlLabel
      control={<MuiSwitch />}
      label="Oscura anagrafica"
      {...field}
      onChange={(_, checked) => helpers.setValue(checked)}
      error={Boolean(meta.touched && meta.error)}
      helperText={meta.touched && meta.error ? meta.error : undefined}
      labelPlacement={props.labelPlacement || 'start'}
      {...props}
    />
  );
};

export default Switch;
