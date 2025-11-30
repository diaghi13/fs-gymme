import React from 'react';
import { Form } from 'formik';
import { Button, Divider, Grid, Typography } from '@mui/material';
import Checkbox from '@/components/ui/Checkbox';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import { usePage } from '@inertiajs/react';
import { BaseProductPageProps } from '@/pages/products/base-products';
import Autocomplete from '@/components/ui/Autocomplete';
import { VatRate } from '@/types';

interface SellingFormProps {
  onDismiss: () => void;
}

export default function SaleForm({ onDismiss }: SellingFormProps) {
  const { vatRateOptions } = usePage<BaseProductPageProps>().props;

  return (
    <Form>
      <Grid container spacing={4}>
        <Grid size={12}>
          <Checkbox label="Vendibile in abbonamento" name="saleable_in_subscription" />
        </Grid>
        <Grid size={12}>
          <Typography variant={'subtitle1'}>Imposta IVA</Typography>
        </Grid>
        <Grid size={12}>
          <Divider />
        </Grid>
          <Grid size={12} >
            <Grid container spacing={2} alignItems={"flex-end"}>
              <Grid size={12}>
                <Autocomplete<VatRate>
                  label={"IVA"}
                  options={vatRateOptions}
                  getOptionLabel={(option) => option.code + ' ' + option.description}
                  name={'vat_rate'}
                />
              </Grid>
            </Grid>
          </Grid>
        <Grid size={12}>
          <Divider />
        </Grid>
        <Grid size={12}>
          <TextField
            label={'Descrizione fattura/ricevuta *'}
            name={'selling_description'}
            multiline
          />
        </Grid>
        <Grid size={12} sx={{ textAlign: 'end' }}>
          <Button size="small" sx={{ marginRight: 2 }} onClick={onDismiss}>Annulla</Button>
          <FormikSaveButton />
        </Grid>
      </Grid>
    </Form>
  );
};
