import React from 'react';
import { Box, Typography, Grid, Switch, FormControlLabel, Alert } from '@mui/material';
import { Form, Formik, FormikConfig } from 'formik';
import * as Yup from 'yup';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import { router, usePage } from '@inertiajs/react';
import { PageProps, PriceListToken } from '@/types';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

interface TokenBookingTabProps {
  priceList: PriceListToken;
}

interface BookingFormValues {
  advance_booking_days: number | null;
  cancellation_hours: number | null;
  max_bookings_per_day: number | null;
  requires_booking: boolean;
}

export default function TokenBookingTab({ priceList }: TokenBookingTabProps) {
  const page = usePage<PageProps>().props;
  const { bookableServices } = page as any;

  // Check if token has any bookable services
  const applicableProductIds = priceList.settings?.usage?.applicable_to ?? [];
  const hasBookableServices = applicableProductIds.length > 0;

  // Find the first bookable service to extract default rules
  const firstBookableService = React.useMemo(() => {
    if (!bookableServices || applicableProductIds.length === 0) return null;

    return bookableServices.find((service: any) =>
      applicableProductIds.includes(service.id)
    );
  }, [bookableServices, applicableProductIds]);

  // Extract default booking rules from the BookableService
  const defaultBookingRules = React.useMemo(() => {
    if (!firstBookableService?.settings?.booking) return null;

    return {
      advance_booking_days: firstBookableService.settings.booking.advance_days ?? null,
      cancellation_hours: firstBookableService.settings.booking.cancellation_hours ?? null,
      max_bookings_per_day: firstBookableService.settings.booking.max_per_day ?? null,
    };
  }, [firstBookableService]);

  const formik: FormikConfig<BookingFormValues> = {
    initialValues: {
      // Values are now stored directly in DB (auto-copied from BookableService at creation)
      // Fallback to live inheritance only for backwards compatibility with old tokens
      advance_booking_days: (priceList.settings as any)?.booking?.advance_booking_days ??
                           defaultBookingRules?.advance_booking_days ?? null,
      cancellation_hours: (priceList.settings as any)?.booking?.cancellation_hours ??
                         defaultBookingRules?.cancellation_hours ?? null,
      max_bookings_per_day: (priceList.settings as any)?.booking?.max_bookings_per_day ??
                           defaultBookingRules?.max_bookings_per_day ?? null,
      requires_booking: priceList.settings?.usage?.requires_booking ?? true,
    },
    validationSchema: Yup.object({
      advance_booking_days: Yup.number()
        .nullable()
        .min(0, 'Minimo 0 giorni')
        .max(365, 'Massimo 365 giorni'),
      cancellation_hours: Yup.number()
        .nullable()
        .min(0, 'Minimo 0 ore')
        .max(168, 'Massimo 168 ore (7 giorni)'),
      max_bookings_per_day: Yup.number()
        .nullable()
        .min(1, 'Minimo 1 prenotazione')
        .max(50, 'Massimo 50 prenotazioni'),
    }),
    onSubmit: (values) => {
      // Preserve existing settings and update booking section
      const currentSettings = priceList.settings || {
        usage: { applicable_to: [], all_products: false, requires_booking: true, auto_deduct: true },
        validity: { starts_on_purchase: true, starts_on_first_use: false, expires_if_unused: true },
        restrictions: { max_per_day: null, blackout_dates: [], transferable: false },
      };

      const updatedSettings = {
        ...currentSettings,
        usage: {
          ...currentSettings.usage,
          requires_booking: values.requires_booking,
        },
        booking: {
          advance_booking_days: values.advance_booking_days,
          cancellation_hours: values.cancellation_hours,
          max_bookings_per_day: values.max_bookings_per_day,
        },
      };

      router.patch(
        route('app.price-lists.tokens.update', {
          token: priceList.id,
          tenant: page.currentTenantId
        }),
        { settings: updatedSettings },
        { preserveState: false }
      );
    },
    enableReinitialize: true,
  };

  if (!priceList.id) {
    return (
      <Alert severity="info">
        Salva il token prima di configurare le regole di prenotazione
      </Alert>
    );
  }

  if (!hasBookableServices) {
    return (
      <Alert severity="info" icon={<EventAvailableIcon />}>
        <Typography variant="body2" gutterBottom>
          <strong>Nessun servizio prenotabile selezionato</strong>
        </Typography>
        <Typography variant="body2">
          Seleziona almeno un servizio prenotabile nella tab "Generale" per configurare le regole di prenotazione.
        </Typography>
      </Alert>
    );
  }

  return (
    <Formik {...formik}>
      {({ values, setFieldValue }) => (
        <Form>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventAvailableIcon />
              Regole di prenotazione
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configura le regole specifiche per le prenotazioni effettuate con questo token.
              Queste regole sovrascrivono quelle ereditate dai servizi prenotabili.
            </Typography>

            <Grid container spacing={3}>
              {firstBookableService && (
                <Grid size={12}>
                  <Alert severity="success" icon={<EventAvailableIcon />}>
                    <Typography variant="body2" gutterBottom>
                      <strong>✓ Regole copiate da: {firstBookableService.name}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Alla creazione del token, le regole sono state <strong>copiate definitivamente</strong> nel database
                      per garantire coerenza e facilitare le query future. Puoi modificarle qui senza influenzare il servizio originale.
                    </Typography>
                    {defaultBookingRules && (values.advance_booking_days || values.cancellation_hours || values.max_bookings_per_day) && (
                      <Box sx={{ mt: 1, pl: 2, borderLeft: '3px solid', borderColor: 'success.main' }}>
                        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                          Valori attualmente configurati:
                        </Typography>
                        {values.advance_booking_days && (
                          <Typography variant="caption" display="block">
                            • Anticipo: {values.advance_booking_days} giorni
                          </Typography>
                        )}
                        {values.cancellation_hours && (
                          <Typography variant="caption" display="block">
                            • Cancellazione: {values.cancellation_hours} ore
                          </Typography>
                        )}
                        {values.max_bookings_per_day && (
                          <Typography variant="caption" display="block">
                            • Max/giorno: {values.max_bookings_per_day}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Alert>
                </Grid>
              )}

              <Grid size={12}>
                <Alert severity="info">
                  <strong>Nota:</strong> Lascia i campi vuoti per usare i valori di default del servizio,
                  oppure inserisci valori personalizzati per questo token.
                </Alert>
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.requires_booking}
                      onChange={(e) => setFieldValue('requires_booking', e.target.checked)}
                    />
                  }
                  label="Richiede prenotazione"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Se attivo, il cliente deve prenotare prima di utilizzare il token
                </Typography>
              </Grid>

              <Grid size={6}>
                <TextField
                  label="Anticipo massimo prenotazione (giorni)"
                  name="advance_booking_days"
                  type="number"
                  placeholder={defaultBookingRules?.advance_booking_days
                    ? `Default: ${defaultBookingRules.advance_booking_days}`
                    : 'Usa default del servizio'}
                  helperText={defaultBookingRules?.advance_booking_days
                    ? `Lascia vuoto per usare default (${defaultBookingRules.advance_booking_days} giorni)`
                    : 'Quanti giorni prima può prenotare'}
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  label="Ore minime per cancellazione gratuita"
                  name="cancellation_hours"
                  type="number"
                  placeholder={defaultBookingRules?.cancellation_hours
                    ? `Default: ${defaultBookingRules.cancellation_hours}`
                    : 'Usa default del servizio'}
                  helperText={defaultBookingRules?.cancellation_hours
                    ? `Lascia vuoto per usare default (${defaultBookingRules.cancellation_hours} ore)`
                    : 'Ore prima per cancellare senza penale'}
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  label="Max prenotazioni al giorno"
                  name="max_bookings_per_day"
                  type="number"
                  placeholder={defaultBookingRules?.max_bookings_per_day
                    ? `Default: ${defaultBookingRules.max_bookings_per_day}`
                    : 'Usa default del servizio'}
                  helperText={defaultBookingRules?.max_bookings_per_day
                    ? `Lascia vuoto per usare default (${defaultBookingRules.max_bookings_per_day} al giorno)`
                    : 'Numero massimo prenotazioni giornaliere'}
                />
              </Grid>

              <Grid size={12}>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Riepilogo regole attive
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • {values.requires_booking ? 'Prenotazione obbligatoria' : 'Prenotazione non richiesta'}
                  </Typography>
                  {values.advance_booking_days && (
                    <Typography variant="body2" color="text.secondary">
                      • Prenotazione fino a {values.advance_booking_days} giorni prima
                    </Typography>
                  )}
                  {values.cancellation_hours && (
                    <Typography variant="body2" color="text.secondary">
                      • Cancellazione gratuita fino a {values.cancellation_hours} ore prima
                    </Typography>
                  )}
                  {values.max_bookings_per_day && (
                    <Typography variant="body2" color="text.secondary">
                      • Massimo {values.max_bookings_per_day} prenotazioni al giorno
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid size={12} sx={{ textAlign: 'end', mt: 2 }}>
                <FormikSaveButton />
              </Grid>
            </Grid>
          </Box>
        </Form>
      )}
    </Formik>
  );
}

