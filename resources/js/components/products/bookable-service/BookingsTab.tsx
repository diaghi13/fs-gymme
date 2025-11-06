import React from 'react';
import { Formik, FormikConfig, Form } from 'formik';
import * as Yup from 'yup';
import { router, usePage } from '@inertiajs/react';
import { BookableService, PageProps } from '@/types';
import { RequestPayload } from '@inertiajs/core';
import { Grid, Typography, Divider } from '@mui/material';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import Switch from '@/components/ui/Switch';

interface BookingsTabProps {
  service: BookableService;
  onDismiss: () => void;
}

export default function BookingsTab({ service, onDismiss }: BookingsTabProps) {
  const { currentTenantId } = usePage<PageProps>().props;

  const bookingSettings = service.settings?.booking || {};
  const requirementsSettings = service.settings?.requirements || {};

  const formik: FormikConfig<{
    advance_days: number;
    min_advance_hours: number;
    cancellation_hours: number;
    max_per_day: number | null;
    buffer_minutes: number;
    requires_trainer: boolean;
    requires_equipment: boolean;
    requires_room: boolean;
    min_preparation_minutes: number;
  }> = {
    initialValues: {
      advance_days: bookingSettings.advance_days || 7,
      min_advance_hours: bookingSettings.min_advance_hours || 2,
      cancellation_hours: bookingSettings.cancellation_hours || 24,
      max_per_day: bookingSettings.max_per_day || null,
      buffer_minutes: bookingSettings.buffer_minutes || 15,
      requires_trainer: requirementsSettings.requires_trainer !== false,
      requires_equipment: requirementsSettings.requires_equipment || false,
      requires_room: requirementsSettings.requires_room || false,
      min_preparation_minutes: requirementsSettings.min_preparation_minutes || 0,
    },
    validationSchema: Yup.object({
      advance_days: Yup.number()
        .required('Campo obbligatorio')
        .min(1, 'Deve essere almeno 1 giorno')
        .max(365, 'Massimo 365 giorni'),
      min_advance_hours: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(72, 'Massimo 72 ore'),
      cancellation_hours: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(168, 'Massimo 168 ore (7 giorni)'),
      max_per_day: Yup.number()
        .nullable()
        .min(1, 'Deve essere almeno 1')
        .max(100, 'Massimo 100'),
      buffer_minutes: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(120, 'Massimo 120 minuti'),
      min_preparation_minutes: Yup.number()
        .required('Campo obbligatorio')
        .min(0, 'Non può essere negativo')
        .max(180, 'Massimo 180 minuti'),
    }),
    onSubmit: (values) => {
      const updatedSettings = {
        ...service.settings,
        booking: {
          advance_days: values.advance_days,
          min_advance_hours: values.min_advance_hours,
          cancellation_hours: values.cancellation_hours,
          max_per_day: values.max_per_day,
          buffer_minutes: values.buffer_minutes,
        },
        requirements: {
          requires_trainer: values.requires_trainer,
          requires_equipment: values.requires_equipment,
          requires_room: values.requires_room,
          min_preparation_minutes: values.min_preparation_minutes,
        },
      };

      const data = {
        ...service,
        settings: updatedSettings,
      };

      router.patch(
        route('app.bookable-services.update', {
          bookable_service: service.id,
          tenant: currentTenantId,
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
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={6}>
            <TextField name="advance_days" label="Giorni Anticipo Massimo" type="number" helperText="Max giorni in anticipo per prenotare" fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField name="min_advance_hours" label="Ore Anticipo Minimo" type="number" helperText="Min ore prima dell'appuntamento" fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField name="cancellation_hours" label="Ore per Cancellazione Gratuita" type="number" helperText="Ore prima per cancellare gratis" fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField name="max_per_day" label="Max Prenotazioni al Giorno" type="number" helperText="Lascia vuoto per illimitate" fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField name="buffer_minutes" label="Tempo Buffer (minuti)" type="number" helperText="Pausa tra appuntamenti" fullWidth />
          </Grid>

          <Grid size={12} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Requisiti Servizio</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={6}><Switch name="requires_trainer" label="Richiede Trainer/Operatore" /></Grid>
          <Grid size={6}><Switch name="requires_equipment" label="Richiede Attrezzatura" /></Grid>
          <Grid size={6}><Switch name="requires_room" label="Richiede Sala/Spazio" /></Grid>
          <Grid size={6}>
            <TextField name="min_preparation_minutes" label="Minuti Preparazione" type="number" helperText="Tempo setup prima servizio" fullWidth />
          </Grid>

          <Grid size={12} sx={{ mt: 3, textAlign: 'right' }}>
            <FormikSaveButton />
          </Grid>
        </Grid>
      </Form>
    </Formik>
  );
}
