import {DatePicker as MuiDatePicker, DatePickerProps as MuiDatePickerProps} from "@mui/x-date-pickers";
import {FieldHookConfig, useField} from "formik";

interface DatePickerProps extends MuiDatePickerProps<boolean>{
  label: string;
}

export default function DatePicker({label, ...props}: DatePickerProps & FieldHookConfig<string>) {

  const [field, meta, helpers] = useField(props);

  return (
    <MuiDatePicker
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
