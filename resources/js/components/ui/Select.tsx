import {
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  SelectProps,
} from "@mui/material";
import {FieldHookConfig, useField} from "formik";
import {TextFieldProps as MuiTextFieldProps} from "@mui/material/TextField";

/*interface TextFieldProps extends MuiTextField<MuiTextFieldProps>{
  label: string;
  name: string;
  options: {value: string | number, label: string}[];
}*/

export type TextFieldProps = {
  label?: string;
  name: string;
  options: {label: string, value: string | number};
} & MuiTextFieldProps & SelectProps;

export default function Select(props: TextFieldProps & FieldHookConfig<string>){
  const [field, meta] = useField(props);

  const labelId = `${props.name}-select-label`
  const id = `${props.name}-select`

  return (
    <FormControl
      fullWidth
      error={meta.touched && !!meta.error}
      variant="standard"
      //helperText={meta.touched && meta.error}
    >
      {props.label && <InputLabel id={labelId}>{props.label}</InputLabel>}
      <MuiSelect
        labelId={labelId}
        id={id}
        {...field}
        {...props}
        //label={props.label
        value={field.value ?? ""}
      >
        <MenuItem value={""}>Scegli...</MenuItem>
        {props.options.map((option: {label: string, value: string | number}, index: number) => (
          <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  )
};
