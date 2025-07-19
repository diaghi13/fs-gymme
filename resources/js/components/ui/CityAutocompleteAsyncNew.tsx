import React, { useEffect, useState, useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useField } from 'formik';
import axios from 'axios';
import { CityFull } from '@/types';
import { debounce } from '@mui/material/utils';
import { COMUNI_API } from '@/support/CONSTS';

interface CityAutocompleteAsyncNewProps {
  name: string;
  label?: string;
  onCitySelect?: (city: CityFull | null) => void;
}

const fetchCity = async (search: string): Promise<CityFull[]> => {
  if (!search) return [];
  const response = await axios.get(`${COMUNI_API}/lista-comuni?term=${search}`);
  return response.data;
};

export const CityAutocompleteAsyncNew: React.FC<CityAutocompleteAsyncNewProps> = ({
                                                                                    name,
                                                                                    label = 'Comune',
                                                                                    onCitySelect
                                                                                  }
) => {
  const [field, meta, helpers] = useField<string>(name);
  const [options, setOptions] = useState<CityFull[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState<string>(field.value || '');

  //const selectedCity = options.find(opt => opt.denominazione === field.value) || null;

  const debouncedFetch = useMemo(() => debounce(async (input: string) => {
    setLoading(true);
    try {
      const cities = await fetchCity(input);
      setOptions(cities);
    } catch (error) {
      console.error('Errore durante il fetch dei comuni:', error);
    } finally {
      setLoading(false);
    }
  }, 400), []);

  useEffect(() => {
    setInputValue(field.value || '');
  }, [field.value]);

  return (
    <Autocomplete
      freeSolo={true}
      loading={loading}
      options={options}
      getOptionLabel={option => typeof option === 'string' ? option : option.denominazione}
      value={options.find(opt => opt.denominazione === field.value) || null}
      inputValue={inputValue}
      onInputChange={(_, newInputValue, reason) => {
        setInputValue(newInputValue);
        helpers.setValue(newInputValue);
        // Solo se l'utente digita, aggiorna inputValue e Formik
        if (reason === 'input') {
          //if (newInputValue && newInputValue !== field.value) {
          debouncedFetch(newInputValue);
          //}
        }
      }}
      onChange={(_, newValue) => {
        const cityName = typeof newValue === 'string'
          ? newValue
          : newValue?.denominazione || '';
        setInputValue(cityName);
        helpers.setValue(cityName);
        onCitySelect?.(typeof newValue === 'object' ? newValue : null);
      }}
      // isOptionEqualToValue={(option, value) =>
      //   option.denominazione === value?.denominazione
      // }
      noOptionsText="Nessuna corrispondenza trovata"
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          variant="standard"
          error={Boolean(meta.touched && meta.error)}
          helperText={meta.touched && meta.error ? String(meta.error) : ''}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }
          }}
        />
      )}
    />
  );
};
