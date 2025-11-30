import React from 'react';
import { Box, Typography, Grid, Switch, FormControlLabel, Alert, Radio, RadioGroup, FormControl } from '@mui/material';
import { Form, Formik, FormikConfig } from 'formik';
import * as Yup from 'yup';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import { router, usePage } from '@inertiajs/react';
import { PageProps, PriceListToken } from '@/types';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface TokenValidityTabProps {
  priceList: PriceListToken;
}

interface ValidityFormValues {
  validity_days: number | null;
  validity_months: number | null;
  starts_on_purchase: boolean;
  starts_on_first_use: boolean;
  expires_if_unused: boolean;
  max_per_day: number | null;
  transferable: boolean;
}

export default function TokenValidityTab({ priceList }: TokenValidityTabProps) {
  const page = usePage<PageProps>().props;

  const formik: FormikConfig<ValidityFormValues> = {
    initialValues: {
      validity_days: priceList.validity_days ?? null,
      validity_months: priceList.validity_months ?? null,
      starts_on_purchase: priceList.settings?.validity?.starts_on_purchase ?? true,
      starts_on_first_use: priceList.settings?.validity?.starts_on_first_use ?? false,
      expires_if_unused: priceList.settings?.validity?.expires_if_unused ?? true,
      max_per_day: priceList.settings?.restrictions?.max_per_day ?? null,
      transferable: priceList.settings?.restrictions?.transferable ?? false,
    },
    validationSchema: Yup.object({
      validity_days: Yup.number()
        .nullable()
        .min(1, 'Minimo 1 giorno')
        .max(3650, 'Massimo 10 anni'),
      validity_months: Yup.number()
        .nullable()
        .min(1, 'Minimo 1 mese')
        .max(120, 'Massimo 10 anni'),
      max_per_day: Yup.number()
        .nullable()
        .min(1, 'Minimo 1')
        .max(100, 'Massimo 100'),
    }),
    onSubmit: (values) => {
      // Preserve existing settings and update validity/restrictions sections
      const currentSettings = priceList.settings || {
        usage: { applicable_to: [], all_products: false, requires_booking: true, auto_deduct: true },
        validity: { starts_on_purchase: true, starts_on_first_use: false, expires_if_unused: true },
        restrictions: { max_per_day: null, blackout_dates: [], transferable: false },
      };

      const updatedSettings = {
        ...currentSettings,
        validity: {
          starts_on_purchase: values.starts_on_purchase,
          starts_on_first_use: values.starts_on_first_use,
          expires_if_unused: values.expires_if_unused,
        },
        restrictions: {
          ...(currentSettings.restrictions || {}),
          max_per_day: values.max_per_day,
          transferable: values.transferable,
        },
      };

      router.patch(
        route('app.price-lists.tokens.update', {
          token: priceList.id,
          tenant: page.currentTenantId
        }),
        {
          validity_days: values.validity_days,
          validity_months: values.validity_months,
          settings: updatedSettings,
        },
        { preserveState: false }
      );
    },
    enableReinitialize: true,
  };

  if (!priceList.id) {
    return (
      <Alert severity="info">
        Salva il token prima di configurare le regole di validità avanzate
      </Alert>
    );
  }

  return (
    <Formik {...formik}>
      {({ values, setFieldValue }) => (
        <Form>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon />
              Validità e Restrizioni
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configura la validità del token e le restrizioni d'uso
            </Typography>

            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Durata Validità
                </Typography>
              </Grid>

              <Grid size={6}>
                <TextField
                  label="Validità (giorni)"
                  name="validity_days"
                  type="number"
                  helperText="Numero di giorni dalla data di inizio"
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  label="Validità (mesi)"
                  name="validity_months"
                  type="number"
                  helperText="Alternativa alla validità in giorni"
                />
              </Grid>

              <Grid size={12}>
                <Alert severity="info">
                  <strong>Nota:</strong> Puoi specificare la validità in giorni o mesi.
                  Se specifichi entrambi, i giorni hanno precedenza.
                </Alert>
              </Grid>

              <Grid size={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Inizio Validità
                </Typography>
              </Grid>

              <Grid size={12}>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={values.starts_on_first_use ? 'first_use' : 'purchase'}
                    onChange={(e) => {
                      const isFirstUse = e.target.value === 'first_use';
                      setFieldValue('starts_on_first_use', isFirstUse);
                      setFieldValue('starts_on_purchase', !isFirstUse);
                    }}
                  >
                    <FormControlLabel
                      value="purchase"
                      control={<Radio />}
                      label="Decorre dalla data di acquisto"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mb: 1 }}>
                      Il conteggio della validità inizia immediatamente all'acquisto
                    </Typography>

                    <FormControlLabel
                      value="first_use"
                      control={<Radio />}
                      label="Decorre dal primo utilizzo"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                      Il conteggio della validità inizia solo al primo ingresso/prenotazione
                    </Typography>
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.expires_if_unused}
                      onChange={(e) => setFieldValue('expires_if_unused', e.target.checked)}
                    />
                  }
                  label="Scade se non utilizzato"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Se attivo, il token scade anche se non è mai stato utilizzato
                </Typography>
              </Grid>

              <Grid size={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Restrizioni d'Uso
                </Typography>
              </Grid>

              <Grid size={6}>
                <TextField
                  label="Utilizzi massimi al giorno"
                  name="max_per_day"
                  type="number"
                  helperText="Limite di utilizzi giornalieri (vuoto = nessun limite)"
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.transferable}
                      onChange={(e) => setFieldValue('transferable', e.target.checked)}
                    />
                  }
                  label="Trasferibile ad altro utente"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Se attivo, il token può essere ceduto/regalato ad un altro cliente
                </Typography>
              </Grid>

              <Grid size={12}>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Riepilogo configurazione
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Validità: {values.validity_days ? `${values.validity_days} giorni` : values.validity_months ? `${values.validity_months} mesi` : 'Non specificata'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Decorrenza: {values.starts_on_first_use ? 'Dal primo utilizzo' : 'Dall\'acquisto'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • {values.expires_if_unused ? 'Scade anche se inutilizzato' : 'Non scade se inutilizzato'}
                  </Typography>
                  {values.max_per_day && (
                    <Typography variant="body2" color="text.secondary">
                      • Massimo {values.max_per_day} utilizzi al giorno
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    • {values.transferable ? 'Trasferibile' : 'Non trasferibile'}
                  </Typography>
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
