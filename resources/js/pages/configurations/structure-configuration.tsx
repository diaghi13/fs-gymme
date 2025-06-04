import * as React from 'react';
import { PageProps } from '@/types';
import { Form, Formik, FormikConfig } from 'formik';
import MyCard from '@/components/ui/MyCard';
import { Button, Grid } from '@mui/material';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import Layout from '@/layouts/configurations/Layout';

export interface StructureFormValues {
  name: string;
  street: string;
  number: string;
  city: string;
  zip_code: string;
  province: string;
  country: string;
}

interface StructureConfigurationProps extends PageProps {
  structure: {
    name: string;
    street: string;
    number: string;
    city: string;
    zip_code: string;
    province: string;
    country: string;
  }
}

const StructureConfiguration: React.FC<StructureConfigurationProps> = ({ auth, structure }) => {
  const formik: FormikConfig<StructureFormValues> = {
    initialValues: {
      name: structure.name,
      street: structure.street,
      number: structure.number,
      city: structure.city,
      zip_code: structure.zip_code,
      province: structure.province,
      country: structure.country
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
                  name={"name"}
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

export default StructureConfiguration;
