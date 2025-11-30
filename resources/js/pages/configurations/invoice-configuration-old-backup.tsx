import * as React from 'react';
import { PageProps } from '@/types';
import { Form, Formik, FormikConfig } from 'formik';
import MyCard from '@/components/ui/MyCard';
import { Alert, AlertTitle, Box, Grid, Typography } from '@mui/material';
import TextField from '@/components/ui/TextField';
import Switch from '@/components/ui/Switch';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import Layout from '@/layouts/configurations/Layout';
import { router } from '@inertiajs/react';

export interface InvoiceFormValues {
  stamp_duty: {
    charge_customer: boolean;
    amount: number;
    threshold: number;
  };
}

interface InvoiceConfigurationProps extends PageProps {
  settings: {
    stamp_duty: {
      charge_customer: boolean;
      amount: number;
      threshold: number;
    };
  };
}

const InvoiceConfiguration: React.FC<InvoiceConfigurationProps> = ({ auth, settings, currentTenantId }) => {
  const formik: FormikConfig<InvoiceFormValues> = {
    initialValues: {
      stamp_duty: {
        charge_customer: settings.stamp_duty.charge_customer,
        amount: settings.stamp_duty.amount / 100, // Converti centesimi in euro
        threshold: Number(settings.stamp_duty.threshold),
      },
    },
    onSubmit: (values) => {
      // Converti euro in centesimi per il backend
      const payload = {
        stamp_duty: {
          charge_customer: values.stamp_duty.charge_customer,
          amount: Math.round(values.stamp_duty.amount * 100), // Converti euro in centesimi
          threshold: values.stamp_duty.threshold,
        },
      };

      router.patch(
        route('app.configurations.invoice.update', { tenant: currentTenantId }),
        payload,
        {
          preserveScroll: true,
          onSuccess: () => {
            console.log('Configurazione salvata');
          },
          onError: (errors) => {
            console.error('Errore salvataggio:', errors);
          },
        }
      );
    },
  };

  return (
    <Layout user={auth.user}>
      <Formik {...formik}>
        {({ values }) => (
          <Form>
            <MyCard title="Fatturazione Elettronica">
              <Grid container spacing={3}>
                {/* Info Alert */}
                <Grid size={12}>
                  <Alert severity="info">
                    <AlertTitle>Configurazione Fatturazione Elettronica</AlertTitle>
                    <Typography variant="body2">
                      Queste impostazioni determinano come vengono gestite le fatture elettroniche verso il Sistema di
                      Interscambio (SDI) dell'Agenzia delle Entrate.
                    </Typography>
                  </Alert>
                </Grid>

                {/* Imposta di Bollo Section */}
                <Grid size={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                    Imposta di Bollo (Marca da Bollo Virtuale)
                  </Typography>
                </Grid>

                <Grid size={12}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Regole Agenzia delle Entrate:
                    </Typography>
                    <Typography variant="body2" component="div">
                      L'imposta di bollo si applica quando:
                      <ul style={{ marginTop: 8, marginBottom: 0 }}>
                        <li>Totale fattura superiore alla soglia configurata (default 77,47€)</li>
                        <li>Almeno una riga con operazioni esenti/non imponibili IVA</li>
                        <li>Importo fisso: 2,00€</li>
                      </ul>
                    </Typography>
                  </Alert>
                </Grid>

                <Grid size={12}>
                  <Switch
                    name="stamp_duty.charge_customer"
                    label="Addebita al cliente"
                    helperText="Se attivo, l'imposta di bollo viene addebitata al cliente e mostrata nel totale fattura. Se disattivo, l'azienda se ne fa carico internamente."
                  />
                </Grid>

                <Grid size={6}>
                  <TextField
                    name="stamp_duty.amount"
                    label="Importo Bollo (€)"
                    type="number"
                    step="0.01"
                    helperText="Importo in euro. Default: 2,00€"
                  />
                </Grid>

                <Grid size={6}>
                  <TextField
                    name="stamp_duty.threshold"
                    label="Soglia Minima (€)"
                    type="number"
                    step="0.01"
                    helperText="Soglia minima in euro. Default: 77,47€"
                  />
                </Grid>

                {/* Preview */}
                <Grid size={12}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Configurazione Attuale:</strong>
                    </Typography>
                    <Typography variant="body2">
                      • Importo: <strong>{Number(values.stamp_duty.amount).toFixed(2)}€</strong>
                    </Typography>
                    <Typography variant="body2">
                      • Soglia: <strong>{Number(values.stamp_duty.threshold).toFixed(2)}€</strong>
                    </Typography>
                    <Typography variant="body2">
                      • Modalità:{' '}
                      <strong>{values.stamp_duty.charge_customer ? 'Addebitato al cliente' : 'A carico aziendale'}</strong>
                    </Typography>
                  </Box>
                </Grid>

                {/* Save Button */}
                <Grid size={12}>
                  <FormikSaveButton fullWidth>Salva Configurazione</FormikSaveButton>
                </Grid>
              </Grid>
            </MyCard>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default InvoiceConfiguration;
