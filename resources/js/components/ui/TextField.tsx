import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps, IconButton, InputAdornment } from "@mui/material";
import { FieldHookConfig, useField } from "formik";
import { useState } from "react";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

type TextFieldProps = {
    //label: string;
} & MuiTextFieldProps

export default function TextField(props: TextFieldProps & FieldHookConfig<string>) {
    const [field, meta] = useField(props);
    const [showPassword, setShowPassword] = useState(false);

    // Check if this is a password field
    const isPasswordField = props.type === 'password';

    // Determine the actual input type
    const inputType = isPasswordField && showPassword ? 'text' : props.type;

    // Password toggle button
    const passwordToggle = isPasswordField ? (
        <InputAdornment position="end">
            <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
            >
                {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
        </InputAdornment>
    ) : undefined;

    return (
        <MuiTextField
            label={props.label}
            variant="standard"
            fullWidth
            error={meta.touched && !!meta.error}
            helperText={(meta.touched && meta.error) || props.helperText}
            {...field}
            value={field.value ?? ''}
            {...props}
            type={inputType}
            InputProps={{
                ...props.InputProps,
                endAdornment: passwordToggle,
            }}
        />
    );
};
