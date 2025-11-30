import * as React from 'react';
import { PageProps } from '@/types';
import { Form, Formik, FormikConfig } from 'formik';
import MyCard from '@/components/ui/MyCard';
import Autocomplete from '@/components/ui/Autocomplete';
import TextField from '@/components/ui/TextField';
import Switch from '@/components/ui/Switch';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import Layout from '@/layouts/configurations/Layout';
import { LogoUploader } from '@/components/configurations/LogoUploader';
import { TemplatePreview } from '@/components/configurations/TemplatePreview';
import { TemplatePreviewModal } from '@/components/configurations/TemplatePreviewModal';
import FormattedCurrency from '@/components/ui/FormattedCurrency';
import { router } from '@inertiajs/react';

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';

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
    template: string;
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
      template: string;
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
  // State for preview modal
  const [previewModalOpen, setPreviewModalOpen] = React.useState(false);
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = React.useState<'classic' | 'modern' | 'minimal'>('classic');

  // PDF Templates
  const pdfTemplates = [
    {
      value: 'classic' as const,
      label: 'Classic',
      description: 'Template tradizionale con layout a due colonne',
      features: ['Header con logo', 'Due colonne cliente/cedente', 'Tabella righe classica'],
    },
    {
      value: 'modern' as const,
      label: 'Modern',
      description: 'Design moderno e pulito con colori accent',
      features: ['Layout più spaziato', 'Typography moderna', 'Colori vivaci'],
    },
    {
      value: 'minimal' as const,
      label: 'Minimal',
      description: 'Design minimalista essenziale',
      features: ['Solo bianco e nero', 'Nessuna decorazione', 'Focus sui dati'],
    },
  ];

  const handleOpenPreview = (template: 'classic' | 'modern' | 'minimal') => {
    setSelectedPreviewTemplate(template);
    setPreviewModalOpen(true);
  };

  const handleGenerateSamplePdf = () => {
    // Open sample PDF in new tab
    window.open(
      route('app.configurations.invoice.sample-pdf', {
        tenant: currentTenantId,
        template: selectedPreviewTemplate,
      }),
      '_blank'
    );
  };

  // Generate preview number
  const generatePreviewNumber = (format: string, start: number, padding: number) => {
    const year = new Date().getFullYear();
    const number = String(start).padStart(padding, '0');
    return format.replace('{year}', String(year)).replace('{number}', number);
  };

  // Debug: log what we receive from backend
  console.log('Settings from backend:', settings.stamp_duty);

  const formik: FormikConfig<InvoiceFormValues> = {
    enableReinitialize: true,
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
        template: settings.pdf.template,
      },
      stamp_duty: {
        charge_customer: settings.stamp_duty.charge_customer,
        amount: settings.stamp_duty.amount / 100, // Convert cents to euros
        threshold: Number(settings.stamp_duty.threshold),
      },
    },
    onSubmit: (values, { setSubmitting }) => {
      // Backend will convert euros to cents, so we send euros directly
      console.log('Form values (in euros):', values.stamp_duty);

      const payload = {
        ...values,
        stamp_duty: {
          ...values.stamp_duty,
          // Send amount in euros - backend will convert to cents
          amount: Number(values.stamp_duty.amount),
          threshold: Number(values.stamp_duty.threshold),
        },
      };

      console.log('Payload being sent:', payload.stamp_duty);

      router.patch(route('app.configurations.invoice.update', { tenant: currentTenantId }), payload, {
        onFinish: () => setSubmitting(false),
        preserveScroll: true,
      });
    },
  };

  return (
    <Layout user={auth.user}>
      <Formik {...formik}>
        {({ values, handleChange }) => (
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

                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Autocomplete
                            name="defaults.vat_rate_id"
                            label="IVA Predefinita"
                            options={vatRates}
                            getOptionLabel={(option: VatRate) => option?.label || ''}
                          />
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

                        <Grid size={{ xs: 12 }}>
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
                      <Typography variant="subtitle2" gutterBottom>
                        Logo PDF
                      </Typography>
                      <LogoUploader
                        currentLogoPath={values.pdf.logo_path}
                        onUploadSuccess={(path) => handleChange({ target: { name: 'pdf.logo_path', value: path } })}
                        tenantId={currentTenantId}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Switch
                        name="pdf.show_stamp"
                        label="Mostra Imposta di Bollo nel PDF"
                        helperText="Se attivo, l'imposta di bollo sarà visualizzata nel PDF"
                      />
                    </Grid>

                    {/* Template Selector */}
                    <Grid size={12}>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Template PDF
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Scegli il layout grafico per le tue fatture PDF
                      </Typography>
                      <RadioGroup
                        value={values.pdf.template}
                        onChange={(e) => handleChange({ target: { name: 'pdf.template', value: e.target.value } })}
                      >
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          {pdfTemplates.map((template) => (
                            <Grid size={{ xs: 12, md: 4 }} key={template.value}>
                              <Card
                                variant="outlined"
                                sx={{
                                  height: '100%',
                                  border: values.pdf.template === template.value ? 2 : 1,
                                  borderColor: values.pdf.template === template.value ? 'primary.main' : 'divider',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: 'action.hover',
                                  },
                                }}
                                onClick={() => handleChange({ target: { name: 'pdf.template', value: template.value } })}
                              >
                                <CardContent>
                                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                    <FormControlLabel
                                      value={template.value}
                                      control={<Radio />}
                                      label={<Typography variant="h6">{template.label}</Typography>}
                                      sx={{ m: 0 }}
                                    />
                                  </Stack>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {template.description}
                                  </Typography>

                                  {/* Visual preview */}
                                  <Box sx={{ mb: 2 }}>
                                    <TemplatePreview template={template.value} size="small" />
                                  </Box>

                                  <Stack spacing={0.5} sx={{ mb: 2 }}>
                                    {template.features.map((feature, idx) => (
                                      <Typography key={idx} variant="caption" color="text.secondary">
                                        • {feature}
                                      </Typography>
                                    ))}
                                  </Stack>

                                  {/* Preview button */}
                                  <Button
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Visibility />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenPreview(template.value);
                                    }}
                                  >
                                    Anteprima
                                  </Button>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </RadioGroup>
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
                          • Importo: <strong><FormattedCurrency value={Number(values.stamp_duty.amount)} /></strong>
                        </Typography>
                        <Typography variant="body2">
                          • Soglia: <strong><FormattedCurrency value={Number(values.stamp_duty.threshold)} /></strong>
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

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        template={selectedPreviewTemplate}
        templateLabel={pdfTemplates.find((t) => t.value === selectedPreviewTemplate)?.label || ''}
        templateDescription={pdfTemplates.find((t) => t.value === selectedPreviewTemplate)?.description || ''}
        onGenerateSample={handleGenerateSamplePdf}
      />
    </Layout>
  );
};

export default InvoiceConfiguration;

