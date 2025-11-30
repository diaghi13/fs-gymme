import * as React from 'react';
import { PageProps } from '@/types';
import { Form, Formik, FormikConfig } from 'formik';
import MyCard from '@/components/ui/MyCard';
import {
  Alert,
  AlertTitle,
  Box,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import TextField from '@/components/ui/TextField';
import Switch from '@/components/ui/Switch';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import Layout from '@/layouts/configurations/Layout';
import { router } from '@inertiajs/react';

interface VatRate {
  id: number;
  label: string;
}

interface PaymentMethod {
  id: number;
  label: string;
}

export interface InvoiceFormValues {
  progressive: {
    format: string;
    start: number;
    prefix: string;
    reset_yearly: boolean;
    padding: number;
  };
  defaults: {
    vat_rate_id: number | null;
    payment_terms_days: number;
    payment_method_id: number | null;
    notes: string;
  };
  pdf: {
    logo_path: string;
    footer: string;
    show_stamp: boolean;
    legal_notes: string;
  };
  stamp_duty: {
    charge_customer: boolean;
    amount: number;
    threshold: number;
  };
}

interface InvoiceConfigurationProps extends PageProps {
  settings: {
    progressive: {
      format: string;
      start: number;
      prefix: string;
      reset_yearly: boolean;
      padding: number;
    };
    defaults: {
      vat_rate_id: number | null;
      payment_terms_days: number;
      payment_method_id: number | null;
      notes: string;
    };
    pdf: {
      logo_path: string;
      footer: string;
      show_stamp: boolean;
      legal_notes: string;
    };
    stamp_duty: {
      charge_customer: boolean;
      amount: number;
      threshold: number;
    };
  };
  vatRates: VatRate[];
  paymentMethods: PaymentMethod[];
}

const InvoiceConfiguration: React.FC<InvoiceConfigurationProps> = ({
  auth,
  settings,
  vatRates,
  paymentMethods,
  currentTenantId,
}) => {
  // Generate preview number
  const generatePreviewNumber = (format: string, start: number, padding: number) => {
    const year = new Date().getFullYear();
    const number = String(start).padStart(padding, '0');
    return format.replace('{year}', String(year)).replace('{number}', number);
  };

  const formik: FormikConfig<InvoiceFormValues> = {
    initialValues: {
      progressive: {
        format: settings.progressive.format,
        start: settings.progressive.start,
        prefix: settings.progressive.prefix,
        reset_yearly: settings.progressive.reset_yearly,
        padding: settings.progressive.padding,
      },
      defaults: {
        vat_rate_id: settings.defaults.vat_rate_id,
        payment_terms_days: settings.defaults.payment_terms_days,
        payment_method_id: settings.defaults.payment_method_id,
        notes: settings.defaults.notes,
      },
      pdf: {
        logo_path: settings.pdf.logo_path,
        footer: settings.pdf.footer,
        show_stamp: settings.pdf.show_stamp,
        legal_notes: settings.pdf.legal_notes,
      },
      stamp_duty: {
        charge_customer: settings.stamp_duty.charge_customer,
        amount: settings.stamp_duty.amount / 100, // Convert cents to euros
        threshold: Number(settings.stamp_duty.threshold),
      },
    },
    onSubmit: (values) => {
      // Convert euros to cents for stamp duty
      const payload = {
        ...values,
        stamp_duty: {
          ...values.stamp_duty,
          amount: Math.round(values.stamp_duty.amount * 100),
        },
      };

      router.patch(route('app.configurations.invoice.update', { tenant: currentTenantId }), payload, {
        preserveScroll: true,
      });
    },
  };

  return (
    <Layout user={auth.user}>
      <Formik {...formik}>
        {({ values, handleChange, setFieldValue }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Progressive Numbering */}
              <Grid size={12}>
                <MyCard title="Numerazione Progressiva Fatture">
                  <Grid container spacing={3}>
                    <Grid size={12}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          Configura come vengono numerati i documenti. I placeholder disponibili
                          sono: <strong>{'{'}year{'}'}</strong> per l'anno e{' '}
                          <strong>{'{'}number{'}'}</strong> per il numero progressivo.
                        </Typography>
                      </Alert>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        name="progressive.format"
                        label="Formato Numerazione"
                        value={values.progressive.format}
                        onChange={handleChange}
                        helperText="Es: FT-{year}-{number} → FT-2025-0001"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        type="number"
                        name="progressive.start"
                        label="Numero Iniziale"
                        value={values.progressive.start}
                        onChange={handleChange}
                        helperText="Primo numero da usare"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        type="number"
                        name="progressive.padding"
                        label="Padding (Zeri)"
                        value={values.progressive.padding}
                        onChange={handleChange}
                        helperText="Es: 4 → 0001"
                        inputProps={{ min: 1, max: 10 }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        name="progressive.prefix"
                        label="Prefisso (opzionale)"
                        value={values.progressive.prefix}
                        onChange={handleChange}
                        helperText="Prefisso breve, es: FT- o INV-"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Switch
                        name="progressive.reset_yearly"
                        label="Azzera Numerazione Annualmente"
                        helperText="Se attivo, la numerazione ripartirà da 1 ogni anno"
                      />
                    </Grid>

                    <Grid size={12}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'success.50',
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'success.200',
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          Anteprima Numero Fattura
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {generatePreviewNumber(
                            values.progressive.format,
                            values.progressive.start,
                            values.progressive.padding
                          )}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </MyCard>
              </Grid>

              {/* Default Values */}
              <Grid size={12}>
                <MyCard title="Valori Predefiniti Fattura">
                  <Grid container spacing={3}>
                    <Grid size={12}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          Questi valori verranno applicati di default quando crei una nuova fattura.
                          Potrai comunque modificarli per ogni singola fattura.
                        </Typography>
                      </Alert>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>IVA Predefinita</InputLabel>
                        <Select
                          name="defaults.vat_rate_id"
                          value={values.defaults.vat_rate_id || ''}
                          onChange={handleChange}
                          label="IVA Predefinita"
                        >
                          <MenuItem value="">
                            <em>Nessuna</em>
                          </MenuItem>
                          {vatRates.map((vat) => (
                            <MenuItem key={vat.id} value={vat.id}>
                              {vat.label}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>Aliquota IVA applicata di default</FormHelperText>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="number"
                        name="defaults.payment_terms_days"
                        label="Termini di Pagamento (giorni)"
                        value={values.defaults.payment_terms_days}
                        onChange={handleChange}
                        helperText="Numero di giorni per il pagamento (es: 30)"
                        inputProps={{ min: 0, max: 365 }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Metodo di Pagamento Predefinito</InputLabel>
                        <Select
                          name="defaults.payment_method_id"
                          value={values.defaults.payment_method_id || ''}
                          onChange={handleChange}
                          label="Metodo di Pagamento Predefinito"
                        >
                          <MenuItem value="">
                            <em>Nessuno</em>
                          </MenuItem>
                          {paymentMethods.map((pm) => (
                            <MenuItem key={pm.id} value={pm.id}>
                              {pm.label}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>Metodo di pagamento applicato di default</FormHelperText>
                      </FormControl>
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        name="defaults.notes"
                        label="Note Predefinite"
                        value={values.defaults.notes}
                        onChange={handleChange}
                        helperText="Testo note che comparirà in ogni fattura (opzionale)"
                      />
                    </Grid>
                  </Grid>
                </MyCard>
              </Grid>

              {/* PDF Settings */}
              <Grid size={12}>
                <MyCard title="Impostazioni PDF">
                  <Grid container spacing={3}>
                    <Grid size={12}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          Personalizza l'aspetto dei PDF delle fatture con il tuo branding aziendale.
                        </Typography>
                      </Alert>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        name="pdf.logo_path"
                        label="Path Logo Aziendale"
                        value={values.pdf.logo_path}
                        onChange={handleChange}
                        helperText="Percorso del logo da visualizzare nel PDF (es: storage/logos/logo.png)"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Switch
                        name="pdf.show_stamp"
                        label="Mostra Imposta di Bollo nel PDF"
                        helperText="Se attivo, l'imposta di bollo sarà visualizzata nel PDF"
                      />
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        name="pdf.footer"
                        label="Footer PDF"
                        value={values.pdf.footer}
                        onChange={handleChange}
                        helperText="Testo nel footer di ogni pagina (es: info contatto, P.IVA, etc.)"
                      />
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        name="pdf.legal_notes"
                        label="Note Legali"
                        value={values.pdf.legal_notes}
                        onChange={handleChange}
                        helperText="Note legali da includere nel PDF (es: D.Lgs 196/2003, trasparenza, etc.)"
                      />
                    </Grid>
                  </Grid>
                </MyCard>
              </Grid>

              {/* Stamp Duty */}
              <Grid size={12}>
                <MyCard title="Imposta di Bollo (Marca da Bollo Virtuale)">
                  <Grid container spacing={3}>
                    <Grid size={12}>
                      <Alert severity="warning">
                        <AlertTitle>Regole Agenzia delle Entrate</AlertTitle>
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
                        label="Addebita al Cliente"
                        helperText="Se attivo, l'imposta di bollo viene addebitata al cliente. Se disattivo, l'azienda se ne fa carico internamente."
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        name="stamp_duty.amount"
                        label="Importo Bollo (€)"
                        type="number"
                        step="0.01"
                        helperText="Importo in euro. Default: 2,00€"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        name="stamp_duty.threshold"
                        label="Soglia Minima (€)"
                        type="number"
                        step="0.01"
                        helperText="Soglia minima in euro. Default: 77,47€"
                      />
                    </Grid>

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
                          • Addebito:{' '}
                          <strong>{values.stamp_duty.charge_customer ? 'Cliente' : 'Azienda'}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </MyCard>
              </Grid>

              {/* Save Button */}
              <Grid size={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <FormikSaveButton />
                </Box>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default InvoiceConfiguration;

