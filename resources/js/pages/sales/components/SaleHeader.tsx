import React from 'react';
import { Grid, InputAdornment, Chip, Box, FormControlLabel, Switch, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import Autocomplete from '@/components/ui/Autocomplete';
import TextField from '@/components/ui/TextField';
import DatePicker from '@/components/ui/DatePicker';
import MyCard from '@/components/ui/MyCard';
import { Customer } from '@/types';
import { SaleFormValues } from '../sale-create';

interface SaleHeaderProps {
  customers: Customer[];
}

export default function SaleHeader({ customers }: SaleHeaderProps) {
  const { values, setFieldValue } = useFormikContext<SaleFormValues>();

  return (
    <MyCard disableHeaderPadding>
      <Grid container spacing={2}>
        {/* Cliente */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Autocomplete<Customer>
            name="customer"
            label="Cliente"
            options={customers}
            getOptionLabel={(option) => option.option_label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.option_label}
              </li>
            )}
          />
        </Grid>

        {/* Numero Documento (Numero/Anno) */}
        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            name="progressive_number"
            label="N. vendita"
            InputProps={{
              endAdornment: <InputAdornment position="end">/ {values.year}</InputAdornment>,
            }}
            inputProps={{
              style: { textAlign: 'end' },
            }}
            disabled={!values.customer}
          />
        </Grid>

        {/* Anno (hidden field) */}
        <Grid size={{ xs: 12, md: 3 }}>
          <DatePicker name="date" label="Data" disabled={!values.customer} />
        </Grid>

        {/* Customer Info Chip */}
        {values.customer && (
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 1 }}>
              <Chip
                label={values.customer.email}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
              {values.customer.phone && (
                <Chip label={values.customer.phone} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
              )}
            </Box>
          </Grid>
        )}

        {/* Tax Included Switch */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ pt: 1, pb: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={values.tax_included}
                  onChange={(e) => setFieldValue('tax_included', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Prezzi IVA inclusa
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {values.tax_included
                      ? 'I prezzi inseriti sono comprensivi di IVA (default)'
                      : 'I prezzi inseriti sono senza IVA (verrà aggiunta)'}
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Grid>
      </Grid>
    </MyCard>
  );
}
