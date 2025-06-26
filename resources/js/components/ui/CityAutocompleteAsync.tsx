import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import axios from "axios";
import { COMUNI_API } from "@/support/CONSTS";
import { debounce } from "@mui/material/utils";
import { City, CityFull } from "@/types";

interface CityAutocompleteAsyncProps {
  label: string;
  onSelect: (value: CityFull | null) => void;
  initialValue?: CityFull | null;
}

export default function CityAutocompleteAsync({ onSelect, label, initialValue }: CityAutocompleteAsyncProps) {
  const [value, setValue] = React.useState<CityFull | null>(initialValue ?? null);
  const [inputValue, setInputValue] = React.useState(initialValue?.denominazione ?? '');
  const [options, setOptions] = React.useState<readonly City[]>(initialValue ? [initialValue] : []);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [touched, setTouched] = React.useState<boolean>(false);

  const fetch = React.useMemo(
    () =>
      debounce(async (input: string, callback: (results?: readonly City[]) => void) => {
        try {
          const response = await axios.get(`${COMUNI_API}/lista-comuni?term=${input}`);
          callback(response.data as City[]);
        } catch {
          callback([]);
        }
      }, 400),
    []
  );

  React.useEffect(() => {
    let active = true;

    if (!touched) {
      setOptions(value ? [value] : []);
      setLoading(false);
      return;
    }

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(inputValue, (results?: readonly City[]) => {
      if (active) {
        let newOptions: readonly City[] = value ? [value] : [];
        if (results) newOptions = [...newOptions, ...results];
        setOptions(newOptions);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch, touched]);

  React.useEffect(() => {
    onSelect(value);
  }, [value, onSelect]);

  return (
    <Autocomplete
      fullWidth
      options={options}
      loading={loading}
      value={value}
      getOptionLabel={(option) => `${option.denominazione} (${option.sigla})`}
      isOptionEqualToValue={(option, val) =>
        option.denominazione === val.denominazione && option.sigla === val.sigla
      }
      filterOptions={x => x}
      onChange={(_, newValue) => {
        setValue(newValue as CityFull);
      }}
      inputValue={inputValue}
      onInputChange={(_, newInputValue, reason) => {
        setInputValue(newInputValue);
        if (!touched && reason === 'input') setTouched(true);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="standard"
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }
          }}
          // InputProps={{
          //   ...params.InputProps,
          //   endAdornment: (
          //     <>
          //       {loading ? <CircularProgress color="inherit" size={20} /> : null}
          //       {params.InputProps.endAdornment}
          //     </>
          //   ),
          // }}
        />
      )}
    />
  );
}
