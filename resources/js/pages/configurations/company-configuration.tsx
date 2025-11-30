import * as React from 'react';
import { PageProps } from '@/types';
import { Form, Formik, FormikConfig } from 'formik';
import MyCard from '@/components/ui/MyCard';
import { Button, Grid } from '@mui/material';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import Layout from '@/layouts/configurations/Layout';
import { router } from '@inertiajs/react';

export interface CompanyFormValues {
  name: string;
  tax_code: string;
  vat_number: string;
  address: string;
  city: string;
  postal_code: string;
  province: string;
  country: string;
  phone: string;
  email: string;
  pec_email: string;
  sdi_code: string;
  fiscal_regime: string;
  website: string;
}

interface CompanyConfigurationProps extends PageProps {
  company: Partial<CompanyFormValues>;
}

const CompanyConfiguration: React.FC<CompanyConfigurationProps> = ({ auth, company, currentTenantId }) => {
  const formik: FormikConfig<CompanyFormValues> = {
    initialValues: {
      name: company.name ?? '',
      tax_code: company.tax_code ?? '',
      vat_number: company.vat_number ?? '',
      address: company.address ?? '',
      city: company.city ?? '',
      postal_code: company.postal_code ?? '',
      province: company.province ?? '',
      country: company.country ?? 'IT',
      phone: company.phone ?? '',
      email: company.email ?? '',
      pec_email: company.pec_email ?? '',
      sdi_code: company.sdi_code ?? '',
      fiscal_regime: company.fiscal_regime ?? '',
      website: company.website ?? '',
    },
    onSubmit: (values, { setSubmitting }) => {
      router.patch(route('app.configurations.company', { tenant: currentTenantId }), values as any, {
        onFinish: () => setSubmitting(false),
        preserveScroll: true,
      });
    },
  };

  return (
    <Layout user={auth.user} title="Configurazione Azienda">
      <Formik {...formik}>
        {({ values, handleChange, isSubmitting }) => (
          <Form>
            <MyCard title={"Azienda"}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField label={"Ragione sociale"} name={"name"} fullWidth value={values.name} onChange={handleChange} />
                </Grid>

                <Grid size={6}>
                  <TextField label={"Codice fiscale"} name={"tax_code"} fullWidth value={values.tax_code} onChange={handleChange} />
                </Grid>

                <Grid size={6}>
                  <TextField label={"Partita IVA"} name={"vat_number"} fullWidth value={values.vat_number} onChange={handleChange} />
                </Grid>

                <Grid size={12}>
                  <TextField label={"Indirizzo"} name={"address"} fullWidth value={values.address} onChange={handleChange} />
                </Grid>

                <Grid size={4}>
                  <TextField label={"Città"} name={"city"} fullWidth value={values.city} onChange={handleChange} />
                </Grid>

                <Grid size={2}>
                  <TextField label={"CAP"} name={"postal_code"} fullWidth value={values.postal_code} onChange={handleChange} />
                </Grid>

                <Grid size={2}>
                  <TextField label={"Provincia"} name={"province"} fullWidth value={values.province} onChange={handleChange} />
                </Grid>

                <Grid size={4}>
                  <TextField label={"Nazione"} name={"country"} fullWidth value={values.country} onChange={handleChange} />
                </Grid>

                <Grid size={6}>
                  <TextField label={"Telefono"} name={"phone"} fullWidth value={values.phone} onChange={handleChange} />
                </Grid>

                <Grid size={6}>
                  <TextField label={"Email"} name={"email"} type="email" fullWidth value={values.email} onChange={handleChange} />
                </Grid>

                <Grid size={6}>
                  <TextField label={"PEC"} name={"pec_email"} type="email" fullWidth value={values.pec_email} onChange={handleChange} />
                </Grid>

                <Grid size={6}>
                  <TextField label={"Codice SDI"} name={"sdi_code"} fullWidth value={values.sdi_code} onChange={handleChange} />
                </Grid>

                <Grid size={6}>
                  <TextField label={"Regime fiscale"} name={"fiscal_regime"} fullWidth value={values.fiscal_regime} onChange={handleChange} />
                </Grid>

                <Grid size={6}>
                  <TextField label={"Sito Web"} name={"website"} fullWidth value={values.website} onChange={handleChange} />
                </Grid>

                <Grid size={12} sx={{ textAlign: 'end' }}>
                  <Button size="small" sx={{ marginRight: 2 }}>Annulla</Button>
                  <FormikSaveButton loading={isSubmitting} />
                </Grid>
              </Grid>
            </MyCard>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default CompanyConfiguration;
