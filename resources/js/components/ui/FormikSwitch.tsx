import { FieldHookConfig, useField } from 'formik';
import * as React from 'react';
import { Switch, SwitchProps } from '@mui/material';

type FormikSwitchProps = {} & SwitchProps & FieldHookConfig<boolean>

const FormikSwitch: React.FC<FormikSwitchProps> = ({ ...props }) => {
  const [ field ] = useField(props);

  return (
    <Switch
      {...field}
      {...props}
      checked={field.value}
      onChange={(event) => {
        field.onChange(event);
        if (props.onChange) {
          props.onChange(event);
        }
      }}
    />
  );
};

export default FormikSwitch;
