import React from "react";
import {MuiColorInput} from "mui-color-input";
import {FieldHookConfig, useField} from "formik";
import {FormControl} from "@mui/material";

interface ColorInputProps {
    label: string;
    format?: "hex" | "hex8" | "hsl" | "hsv" | "rgb";
};

export default function ColorInput(
    props: ColorInputProps
        & FieldHookConfig<string>
) {
    const [field, meta, helpers] = useField(props);
    const format = props.format || "hex";

    const handleChange = (newValue: string) => {
        helpers.setValue(newValue)
    }

    return (
        <FormControl
            error={meta.touched && !!meta.error}
        >
            <MuiColorInput
                variant={"standard"}
                label={props.label}
                value={field.value}
                onChange={handleChange}
                format={format}
                //error={meta.touched && meta.error}
                helperText={meta.touched && meta.error}
                isAlphaHidden
            />
        </FormControl>
    )
};
