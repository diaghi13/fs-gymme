import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import axios from "axios";
import {COMUNI_API} from "@/support/CONSTS";
import {debounce} from "@mui/material/utils";
import {City, CityFull} from "@/types";

interface CityAutocompleteAsyncProps {
  label: string;
  onSelect: (value: CityFull | null) => void;
  initialValue?: string;
}

export default function CityAutocompleteAsync({onSelect, label, initialValue}: CityAutocompleteAsyncProps) {
  const [options, setOptions] = React.useState<City[]>([]);
  const [value, setValue] = React.useState<City | null>(null);
  const [inputValue, setInputValue] = React.useState<string>(initialValue || "");
  const [loading, setLoading] = React.useState(false);

  const fetchCities = React.useCallback(
    debounce(async (input: string) => {
      if (input.length < 3) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(`${COMUNI_API}/lista-comuni?term=${input}`);
        const data = response.data as City[];
        setOptions(data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  React.useEffect(() => {
    if (inputValue) {
      fetchCities(inputValue);
    } else {
      setOptions([]);
    }
  }, [inputValue, fetchCities]);

  React.useEffect(() => {
    if (initialValue) {
      const initialCity = options.find(city => city.denominazione === initialValue);
      setValue(initialCity || null);
      onSelect(initialCity as CityFull);
    }
  }, [initialValue, options, onSelect]);

  return (
    <Autocomplete
      fullWidth
      isOptionEqualToValue={(option) => `${option.denominazione} (${option.sigla})` === `${option.denominazione} (${option.sigla})`}
      getOptionLabel={(option) => `${option.denominazione} (${option.sigla})`}
      filterOptions={x => x}
      options={options}
      loading={loading}
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={(_, newValue: City | null) => {
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue ? {denominazione: newValue.denominazione, sigla: newValue.sigla} : null);
        onSelect(newValue as CityFull);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant={"standard"}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20}/> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
