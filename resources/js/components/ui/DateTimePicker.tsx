import {DateTimePicker as MuiDateTimePicker, DatePickerProps as MuiDatePickerProps} from "@mui/x-date-pickers";
import {FieldHookConfig, useField} from "formik";

interface DateTimePickerProps extends MuiDatePickerProps<boolean>{
  label: string;
}

export default function DateTimePicker({label, ...props}: DateTimePickerProps & FieldHookConfig<string>) {

  const [field, meta, helpers] = useField(props);

  return (
    <MuiDateTimePicker
      id={props.name}
      label={label}
      value={field.value}
      slotProps={{
        textField: {
          variant: "standard",
          sx: {
            width: "100%"
          },
          id: props.name,
          error: meta.touched && !!meta.error,
          helperText: meta.touched && meta.error,
        },
        field: { clearable: true, onClear: () => helpers.setValue(null) },
      }}
      onChange={(value) => {
        helpers.setValue(value)
      }}
      {...props}
    />
  )
};
