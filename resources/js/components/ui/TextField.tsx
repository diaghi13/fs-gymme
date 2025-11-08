import {TextField as MuiTextField, TextFieldProps as MuiTextFieldProps} from "@mui/material";
import {FieldHookConfig, useField} from "formik";

/*interface TextFieldProps extends MuiTextField<MuiTextFieldProps>{
  label: string;
}*/

type TextFieldProps = {
    //label: string;
} & MuiTextFieldProps

export default function TextField(props: TextFieldProps & FieldHookConfig<string>) {
    const [field, meta] = useField(props);

    return (
        <MuiTextField
            label={props.label}
            variant="standard"
            fullWidth
            error={meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            {...field}
            value={field.value ?? ''}
            {...props}
        />
    )
};
