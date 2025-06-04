import { Grid, InputAdornment } from '@mui/material';
import Autocomplete from '@/components/ui/Autocomplete';
import TextField from '@/components/ui/TextField';
import MyCard from '@/components/ui/MyCard';
import React from 'react';
import { AutocompleteOptions, Customer } from '@/types';
import { useFormikContext } from 'formik';
import { SaleFormValues, SalePageProps } from '@/pages/sales/sales';
import DateTimePicker from '@/components/ui/DateTimePicker';
import { usePage } from '@inertiajs/react';

interface HeaderProps {
  customerOptions: Customer[];
  autocompleteDisabled?: boolean;
}

export default function Header({ customerOptions, autocompleteDisabled }: HeaderProps) {
  const { documentTypeElectronicInvoices } = usePage<SalePageProps>().props;
  const { values } = useFormikContext<SaleFormValues>();

  return (
    <MyCard
      disableHeaderPadding
      //title={"Vendita"}
    >
      <Grid container spacing={2}>
        <Grid size={4}>
          <Autocomplete<Customer>
            label={'Cliente'}
            options={customerOptions}
            name={'customer'}
            disabled={autocompleteDisabled}
            getOptionLabel={(option: Customer) => option.option_label || ''}
            isOptionEqualToValue={(option: Customer, value: Customer) => option.id === value.id}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.option_label}
              </li>
            )}
          />
        </Grid>
        <Grid size={2}>
          <TextField
            label={'N. vendita'}
            name={'progressive_number'}
            InputProps={{
              endAdornment: <InputAdornment position="end">/ {values.year}</InputAdornment>
            }}
            inputProps={{
              style: { textAlign: 'end' }
            }}
          />
        </Grid>
        <Grid size={3}>
          {/*<TextField label={'Struttura'} disabled name={'structure'} />*/}
          <Autocomplete<{ id: number; code: string, description: string, label: string }>
            name={'document_type'}
            options={documentTypeElectronicInvoices}
            label={'Tipo documento'}
            getOptionLabel={option => option.label || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.label}
              </li>
            )}
            disabled
          />
        </Grid>
        <Grid size={3}>
          <DateTimePicker
            label={'Data inserimento'}
            name={'date'}
          />
        </Grid>
      </Grid>
    </MyCard>
  );
};
