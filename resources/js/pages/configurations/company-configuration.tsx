import * as React from 'react';
import { PageProps } from '@/types';
import { Form, Formik, FormikConfig } from 'formik';
import MyCard from '@/components/ui/MyCard';
import { Button, Grid } from '@mui/material';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import Layout from '@/layouts/configurations/Layout';

export interface CompanyFormValues {
  business_name: string;
  tax_code: string;
  vat_number: string;
  street: string;
  number: string;
  city: string;
  zip_code: string;
  province: string;
  country: string;
}

interface CompanyConfigurationProps extends PageProps {
  company: {
    business_name: string;
    tax_code: string;
    vat_number: string;
    street: string;
    number: string;
    city: string;
    zip_code: string;
    province: string;
    country: string;
  }
}

const CompanyConfiguration: React.FC<CompanyConfigurationProps> = ({ auth, company }) => {
  const formik: FormikConfig<CompanyFormValues> = {
    initialValues: {
      business_name: company.business_name,
      tax_code: company.tax_code,
      vat_number: company.vat_number,
      street: company.street,
      number: company.number,
      city: company.city,
      zip_code: company.zip_code,
      province: company.province,
      country: company.country
    },
    onSubmit: (values) => {
      console.log(values);
    }
  };
  return (
    <Layout user={auth.user}>
      <Formik {...formik}>
        <Form>
          <MyCard title={"Azienda"}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  label={"Ragione sociale"}
                  name={"business_name"}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label={"Codice fiscale"}
                  name={"tax_code"}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label={"Partita IVA"}
                  name={"vat_number"}
                />
              </Grid>
              <Grid size={10}>
                <TextField
                  label={"Indirizzo"}
                  name={"street"}
                />
              </Grid>
              <Grid size={2}>
                <TextField
                  label={"Numero"}
                  name={"number"}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label={"Città"}
                  name={"city"}
                />
              </Grid>
              <Grid size={2}>
                <TextField
                  label={"CAP"}
                  name={"zip_code"}
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label={"Provincia"}
                  name={"province"}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label={"Nazione"}
                  name={"country"}
                />
              </Grid>
              <Grid size={6}/>
            </Grid>
            <Grid size={12} sx={{ textAlign: 'end' }}>
              <Button size="small" sx={{ marginRight: 2 }}>Annulla</Button>
              <FormikSaveButton />
            </Grid>
          </MyCard>
        </Form>
      </Formik>
    </Layout>
  );
};

export default CompanyConfiguration;
