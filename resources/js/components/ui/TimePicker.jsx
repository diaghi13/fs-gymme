import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers';
import { useField } from 'formik';

export default function TimePicker({ ...props }) {
  const [field, meta, helpers] = useField(props);

  return (
    <MuiTimePicker
      label={props.label}
      value={field.value}
      slotProps={{
        textField: {
          variant: 'standard',
          sx: {
            width: '100%'
          }
        }
      }}
      onChange={(value) => {
        helpers.setValue(value);
      }}
      {...props}
    />
  );
};
