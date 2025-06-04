import * as React from 'react';
import Radio, { RadioProps } from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { FieldHookConfig, useField } from 'formik';
import { FormHelperText } from '@mui/material';

type RadioButtonsGroupProps = {
  label?: string;
  options?: FormControlLabelProps[];
} & RadioProps & FieldHookConfig<string>;

const RadioButtonsGroup: React.FC<RadioButtonsGroupProps> = ({label, options = undefined, ...props}) => {
  const [field, meta] = useField(props)
  return (
    <FormControl error={meta.touched && !!meta.error} variant="standard">
      <FormLabel id={`${label}-radio-buttons-group-label`}>{label}</FormLabel>
      <RadioGroup
        aria-labelledby={`${label}-radio-buttons-group-label`}
        {...field}
        {...props}
      >
        {options?.map((option: {value: string, label: string}) => (
          <FormControlLabel value={option.value} control={<Radio />} label={option.label} key={option.value} />
        ))}
      </RadioGroup>
      <FormHelperText>{meta.error}</FormHelperText>
    </FormControl>
  );
}

export default RadioButtonsGroup
