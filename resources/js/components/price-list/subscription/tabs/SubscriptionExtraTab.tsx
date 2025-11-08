import React from 'react';
import { Formik, FormikConfig, Form } from 'formik';
import { PriceListSubscription } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';
import { RequestPayload } from '@inertiajs/core';
import { Button, Grid, Typography, FormControlLabel, Checkbox } from '@mui/material';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';

export type SubscriptionExtraFormValues = {
  guest_passes_total?: number | null;
  guest_passes_per_month?: number | null;
  multi_location_access?: boolean;
}

interface SubscriptionExtraTabProps {
  priceList: PriceListSubscription;
}

export default function SubscriptionExtraTab({ priceList }: SubscriptionExtraTabProps) {
  const { currentTenantId } = usePage<PriceListPageProps>().props;

  const formik: FormikConfig<SubscriptionExtraFormValues> = {
    initialValues: {
      guest_passes_total: priceList.guest_passes_total ?? null,
      guest_passes_per_month: priceList.guest_passes_per_month ?? null,
      multi_location_access: priceList.multi_location_access ?? false,
    },
    onSubmit: (values) => {
      const data = {
        guest_passes_total: values.guest_passes_total ?? null,
        guest_passes_per_month: values.guest_passes_per_month ?? null,
        multi_location_access: values.multi_location_access ?? false,
      };

      router.patch(
        route('app.price-lists.subscriptions.update', { subscription: priceList.id, tenant: currentTenantId }),
        data as unknown as RequestPayload,
        { preserveState: false }
      );
    },
    enableReinitialize: true
  };

  const handleDismiss = () => {
    router.get(
      route('app.price-lists.index'),
      undefined,
      { preserveState: true }
    );
  };

  return (
    <Formik {...formik}>
      {({ values, setFieldValue }) => (
        <Form>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>
                Benefici Abbonamento
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configura i benefici e vantaggi che si applicano a livello di abbonamento.
              </Typography>
            </Grid>

            <Grid size={4}>
              <TextField
                name="guest_passes_total"
                label="Guest Pass Totali"
                type="number"
                helperText="Numero totale di guest pass all'anno"
              />
            </Grid>

            <Grid size={4}>
              <TextField
                name="guest_passes_per_month"
                label="Guest Pass al Mese"
                type="number"
                helperText="Guest pass disponibili ogni mese"
              />
            </Grid>

            <Grid size={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.multi_location_access ?? false}
                    onChange={(e) => setFieldValue('multi_location_access', e.target.checked)}
                  />
                }
                label="Accesso Multi-Sede"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                Permette l'accesso a tutte le sedi
              </Typography>
            </Grid>

            <Grid size={12} sx={{ textAlign: 'end' }}>
              <Button size="small" sx={{ marginRight: 2 }} onClick={handleDismiss}>Annulla</Button>
              <FormikSaveButton />
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
}
