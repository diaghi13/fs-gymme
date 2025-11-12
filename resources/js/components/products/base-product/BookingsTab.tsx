import React from 'react';
import { Formik, FormikConfig } from 'formik';
import * as Yup from 'yup';
import { router, usePage } from '@inertiajs/react';
import { BaseProduct } from '@/types';
import { RequestPayload } from '@inertiajs/core';
import { BaseProductPageProps } from '@/pages/products/base-products';
import { Form } from 'formik';
import { Grid, Typography, Divider } from '@mui/material';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';

interface BookingsTabProps {
  product: BaseProduct;
  onDismiss: () => void;
}

export default function BookingsTab({ product, onDismiss }: BookingsTabProps) {
  const { currentTenantId } = usePage<BaseProductPageProps>().props;

  // Extract settings with safe defaults - BaseProduct doesn't have booking settings
  const bookingSettings = (product.settings as any)?.booking || {};

  const formik: FormikConfig<{
    advance_days: number;
    min_advance_hours: number;
    cancellation_hours: number;
    max_per_day: number | null;
    buffer_minutes: number;
  }> = {
    initialValues: {
      advance_days: bookingSettings.advance_days || 7,
      min_advance_hours: bookingSettings.min_advance_hours || 24,
      cancellation_hours: bookingSettings.cancellation_hours || 48,
      max_per_day: bookingSettings.max_per_day || null,
      buffer_minutes: bookingSettings.buffer_minutes || 0,
    },
    validationSchema: Yup.object({
      advance_days: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(365, 'Massimo 365 giorni'),
      min_advance_hours: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(168, 'Massimo 168 ore (7 giorni)'),
      cancellation_hours: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(168, 'Massimo 168 ore (7 giorni)'),
      max_per_day: Yup.number()
        .nullable()
        .min(1, 'Deve essere almeno 1')
        .max(50, 'Massimo 50 prenotazioni al giorno'),
      buffer_minutes: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(120, 'Massimo 120 minuti'),
    }),
    onSubmit: (values) => {
      const updatedSettings = {
        ...product.settings,
        booking: {
          advance_days: values.advance_days,
          min_advance_hours: values.min_advance_hours,
          cancellation_hours: values.cancellation_hours,
          max_per_day: values.max_per_day,
          buffer_minutes: values.buffer_minutes,
        },
      };

      const data = {
        ...product,
        settings: updatedSettings,
      };

      router.patch(
        route('app.base-products.update', {
          base_product: product.id,
          tenant: currentTenantId,
          tab: 5,
        }),
        data as unknown as RequestPayload,
        { preserveState: false }
      );
    },
    enableReinitialize: true,
  };

  return (
    <Formik {...formik}>
      <Form>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography variant="h6" gutterBottom>Regole Prenotazione</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Queste impostazioni vengono utilizzate come template quando il prodotto viene aggiunto a un abbonamento
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={6}>
            <TextField
              name="advance_days"
              label="Giorni Anticipo Prenotazione"
              type="number"
              helperText="Giorni massimi di anticipo per prenotare"
              fullWidth
            />
          </Grid>

          <Grid size={6}>
            <TextField
              name="min_advance_hours"
              label="Ore Minime Anticipo"
              type="number"
              helperText="Ore minime di anticipo per prenotare"
              fullWidth
            />
          </Grid>

          <Grid size={6}>
            <TextField
              name="cancellation_hours"
              label="Ore Minime Cancellazione"
              type="number"
              helperText="Ore minime per cancellare senza penali"
              fullWidth
            />
          </Grid>

          <Grid size={6}>
            <TextField
              name="max_per_day"
              label="Max Prenotazioni al Giorno"
              type="number"
              helperText="Lascia vuoto per illimitato"
              fullWidth
            />
          </Grid>

          <Grid size={6}>
            <TextField
              name="buffer_minutes"
              label="Minuti Buffer"
              type="number"
              helperText="Tempo di pausa tra prenotazioni consecutive"
              fullWidth
            />
          </Grid>

          <Grid size={12} sx={{ mt: 3, textAlign: 'right' }}>
            <FormikSaveButton />
          </Grid>
        </Grid>
      </Form>
    </Formik>
  );
}
