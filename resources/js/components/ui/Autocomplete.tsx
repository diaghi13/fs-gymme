import React from "react";
import {Autocomplete as MuiAutocomplete, TextField, AutocompleteProps as MuiAutocompleteProps} from "@mui/material";
import {useField} from "formik";

type AutocompleteProps<Value> = {
  //options: AutocompleteOptions<string | number>;
  label?: string;
  name: string;
} & Omit<MuiAutocompleteProps<Value, false, false, false>, 'renderInput'>;

function Autocomplete<T>({options, ...props}: AutocompleteProps<T>) {
  const [field, meta, helpers] = useField(props);

  return (
    <MuiAutocomplete
      //disablePortal
      options={options}
      onChange={(_, value) => {
        helpers.setValue(value);
      }}
      value={field.value}
      renderInput={(params) =>
        <TextField
          {...params}
          label={props.label}
          variant="standard"
          error={meta.touched && Boolean(meta.error)}
          helperText={meta.touched && meta.error}
        />
      }
      {...props}
    />
  )
};

export default Autocomplete;
