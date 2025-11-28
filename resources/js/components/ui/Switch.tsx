import * as React from 'react';
import { Switch as MuiSwitch } from '@mui/material';
import { FieldHookConfig, useField } from 'formik';
import FormControlLabel from '@mui/material/FormControlLabel';

export type SwitchProps = FieldHookConfig<boolean> & {
  label?: string;
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
  helperText?: string;
};

const Switch: React.FC<SwitchProps> = (props: SwitchProps) => {
  const { helperText, label, labelPlacement = 'start', ...fieldConfig } = props;

  // useField requires a `name` in the config
  const [field, meta, helpers] = useField<boolean>(fieldConfig as FieldHookConfig<boolean>);

  return (
    <div>
      <FormControlLabel
        control={
          <MuiSwitch
            {...field}
            checked={!!field.value}
            onChange={(_, checked) => helpers.setValue(checked)}
          />
        }
        label={label || ''}
        labelPlacement={labelPlacement}
      />

      {(helperText || (meta.touched && meta.error)) && (
        <div
          style={{
            fontSize: '0.75rem',
            color: meta.touched && meta.error ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)',
            marginTop: '3px',
            marginLeft: labelPlacement === 'start' ? '0' : '14px',
          }}
        >
          {meta.touched && meta.error ? meta.error : helperText}
        </div>
      )}
    </div>
  );
};

export default Switch;
