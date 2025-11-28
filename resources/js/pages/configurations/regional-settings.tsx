import * as React from 'react';
import { PageProps } from '@/types';
import { Form, Formik, FormikConfig } from 'formik';
import Layout from '@/layouts/configurations/Layout';
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material';
import Select from '@/components/ui/Select';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import { router } from '@inertiajs/react';
import { useFormatCurrency } from '@/hooks/useRegionalSettings';
import { FormattedDate } from '@/components/ui/FormattedDate';

interface RegionalSettings {
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
  currency: string;
  decimal_separator: string;
  thousands_separator: string;
}

interface RegionalSettingsProps extends PageProps {
  settings: RegionalSettings;
  timezones: Record<string, Record<string, string>>;
  languages: Record<string, string>;
  currencies: Record<string, string>;
}

const RegionalSettingsPage: React.FC<RegionalSettingsProps> = ({
  settings,
  timezones,
  languages,
  currencies,
  currentTenantId,
}) => {
  const formatCurrency = useFormatCurrency();

  // Prepare options arrays for Select components
  const languageOptions = Object.entries(languages).map(([code, name]) => ({
    value: code,
    label: name,
  }));

  const timezoneOptions = Object.entries(timezones).flatMap(([region, zones]) =>
    Object.entries(zones).map(([tz, label]) => ({
      value: tz,
      label: `${region} - ${label}`,
    }))
  );

  const dateFormatOptions = [
    { value: 'd/m/Y', label: 'GG/MM/AAAA (31/12/2025)' },
    { value: 'm/d/Y', label: 'MM/GG/AAAA (12/31/2025)' },
    { value: 'Y-m-d', label: 'AAAA-MM-GG (2025-12-31)' },
    { value: 'd.m.Y', label: 'GG.MM.AAAA (31.12.2025)' },
  ];

  const timeFormatOptions = [
    { value: 'H:i', label: '24 ore (14:30)' },
    { value: 'h:i A', label: '12 ore (02:30 PM)' },
  ];

  const currencyOptions = Object.entries(currencies).map(([code, name]) => ({
    value: code,
    label: name,
  }));

  const decimalSeparatorOptions = [
    { value: ',', label: ', (virgola) - es: 1.234,56' },
    { value: '.', label: '. (punto) - es: 1,234.56' },
  ];

  const thousandsSeparatorOptions = [
    { value: '.', label: '. (punto) - es: 1.234,56' },
    { value: ',', label: ', (virgola) - es: 1,234.56' },
    { value: ' ', label: ' (spazio) - es: 1 234,56' },
  ];

  const formikConfig: FormikConfig<RegionalSettings> = {
    initialValues: settings,
    onSubmit: (values, { setSubmitting }) => {
      router.patch(
        route('app.configurations.regional.update', { tenant: currentTenantId }),
        values as any,
        {
          onFinish: () => setSubmitting(false),
        }
      );
    },
  };

  return (
    <Layout title="Impostazioni Regionali">
      <Formik {...formikConfig}>
        {({ values, handleChange, isSubmitting }) => (
          <Form>
            <Card>
              <CardHeader
                title="Localizzazione"
                subheader="Configura lingua, fuso orario e formati regionali"
              />
              <CardContent>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Queste impostazioni influenzano la visualizzazione di date, orari, valute e
                  numeri in tutto il sistema.
                </Alert>

                <Grid container spacing={3}>
                  {/* Language */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Select
                      name="language"
                      label="Lingua"
                      options={languageOptions}
                      helperText="Lingua predefinita dell'interfaccia"
                    />
                  </Grid>

                  {/* Timezone */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Select
                      name="timezone"
                      label="Fuso Orario"
                      options={timezoneOptions}
                      helperText="Fuso orario per date e orari visualizzati"
                    />
                  </Grid>

                  {/* Date Format */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Select
                      name="date_format"
                      label="Formato Data"
                      options={dateFormatOptions}
                      helperText="Come visualizzare le date"
                    />
                  </Grid>

                  {/* Time Format */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Select
                      name="time_format"
                      label="Formato Ora"
                      options={timeFormatOptions}
                      helperText="Formato orario 12h o 24h"
                    />
                  </Grid>

                  {/* Currency */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Select
                      name="currency"
                      label="Valuta"
                      options={currencyOptions}
                      helperText="Valuta predefinita"
                    />
                  </Grid>

                  {/* Decimal Separator */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Select
                      name="decimal_separator"
                      label="Separatore Decimale"
                      options={decimalSeparatorOptions}
                      helperText="Carattere per i decimali"
                    />
                  </Grid>

                  {/* Thousands Separator */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Select
                      name="thousands_separator"
                      label="Separatore Migliaia"
                      options={thousandsSeparatorOptions}
                      helperText="Carattere per le migliaia"
                    />
                  </Grid>

                  {/* Preview */}
                  <Grid size={12}>
                    <Alert severity="success" icon={false}>
                      <Typography variant="subtitle2" gutterBottom>
                        Anteprima Formati
                      </Typography>
                      <Typography variant="body2">
                        Data: <FormattedDate value={new Date()} /> <br />
                        Ora: <FormattedDate value={new Date()} showTime /> <br />
                        Importo: {formatCurrency(12345.67)}
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
              <CardContent sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <FormikSaveButton loading={isSubmitting} />
              </CardContent>
            </Card>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default RegionalSettingsPage;
