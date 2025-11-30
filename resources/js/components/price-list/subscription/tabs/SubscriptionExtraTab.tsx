import React from 'react';
import { Formik, FormikConfig, Form } from 'formik';
import { PriceListSubscription } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';
import { RequestPayload } from '@inertiajs/core';
import { Button, Grid, Typography, FormControlLabel, Checkbox, Alert, Box, Divider } from '@mui/material';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationOnIcon from '@mui/icons-material/LocationOn';

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
      route('app.price-lists.index', { tenant: currentTenantId }),
      undefined,
      { preserveState: false }
    );
  };

  return (
    <Formik {...formik}>
      {({ values, setFieldValue }) => (
        <Form>
          <Box>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CardGiftcardIcon />
              Benefici Abbonamento
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configura i benefici e vantaggi aggiuntivi a livello di abbonamento
            </Typography>

            <Grid container spacing={3}>
              <Grid size={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Benefici Extra:</strong> Configura guest pass e accessi multi-sede che si applicano a livello di abbonamento.
                    Questi benefici sono inclusi automaticamente per tutti i contenuti dell'abbonamento.
                  </Typography>
                </Alert>
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupsIcon fontSize="small" />
                  Guest Pass
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Permetti agli abbonati di portare ospiti in palestra
                </Typography>
              </Grid>

              <Grid size={6}>
                <TextField
                  name="guest_passes_total"
                  label="Guest Pass Totali (annuali)"
                  type="number"
                  helperText="Numero totale di guest pass utilizzabili nell'anno"
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  name="guest_passes_per_month"
                  label="Guest Pass al Mese"
                  type="number"
                  helperText="Guest pass disponibili ogni mese (si rinnovano mensilmente)"
                />
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon fontSize="small" />
                  Accesso Sedi
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Configura l'accesso a più sedi della catena
                </Typography>
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.multi_location_access ?? false}
                      onChange={(e) => setFieldValue('multi_location_access', e.target.checked)}
                    />
                  }
                  label="Abilita Accesso Multi-Sede"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                  Permette l'accesso a tutte le sedi/strutture della catena
                </Typography>
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleDismiss}
                >
                  Annulla
                </Button>
                <FormikSaveButton />
              </Grid>
            </Grid>
          </Box>
        </Form>
      )}
    </Formik>
  );
}
