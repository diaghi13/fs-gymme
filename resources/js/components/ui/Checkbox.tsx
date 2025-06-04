import React from 'react';
import {FormControlLabel, FormGroup, Checkbox as MuiCheckbox} from "@mui/material";
import {FieldHookConfig, useField} from "formik";

interface CheckboxProps {
    label: string;
}

export default function Checkbox(props: CheckboxProps & FieldHookConfig<boolean>) {
    const [field, , helpers] = useField({...props, type: "checkbox"})

    const handleChange = (_: never, checked: boolean): undefined => {
        helpers.setValue(checked);
    }

    return (
        <FormGroup>
            <FormControlLabel
                control={
                    <MuiCheckbox
                        {...props}
                        {...field}
                        checked={field.value}
                        onChange={handleChange}
                    />
                }
                label={props.label}
            />
        </FormGroup>
    );
}
