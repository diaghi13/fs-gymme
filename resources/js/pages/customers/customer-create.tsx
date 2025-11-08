import * as React from 'react';
import { Customer, PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Formik, FormikConfig } from 'formik';
import CustomerForm from '@/components/customers/forms/CustomerForm';
import MyCard from '@/components/ui/MyCard';
import { Grid } from '@mui/material';
import { router } from '@inertiajs/react';
import { RequestPayload } from '@inertiajs/core';
import * as Yup from 'yup';

export const customerValidationSchema = Yup.object().shape({
  first_name: Yup.string()
    .required('Il nome è obbligatorio')
    .min(2, 'Il nome deve avere almeno 2 caratteri'),
  last_name: Yup.string()
    .required('Il cognome è obbligatorio')
    .min(2, 'Il cognome deve avere almeno 2 caratteri'),
  birth_date: Yup.date()
    .typeError('La data di nascita deve essere una data valida')
    .nullable(),
  gender: Yup.string()
    .oneOf(['M', 'F', 'other'], 'Seleziona un genere valido')
    .nullable(),
  birthplace: Yup.string()
    .nullable(),
  tax_id_code: Yup.string()
    .required('Il codice fiscale è obbligatorio')
    .matches(/^[A-Z0-9]{16}$/, 'Il codice fiscale deve essere valido'),
  email: Yup.string()
    .email('Inserisci un\'email valida')
    .required('L\'email è obbligatoria'),
  phone: Yup.string()
    .matches(/^\d+$/, 'Il numero di telefono deve contenere solo cifre')
    .min(6, 'Il numero di telefono deve avere almeno 6 cifre')
    .nullable(),
  street: Yup.string()
    .nullable(),
  number: Yup.string()
    .nullable(),
  city: Yup.string()
    .nullable(),
  zip: Yup.string()
    .matches(/^\d{5}$/, 'Il CAP deve essere di 5 cifre')
    .nullable(),
  province: Yup.string()
    .length(2, 'La provincia deve essere di 2 lettere')
    .nullable(),
  country: Yup.string()
    .length(2, 'La nazione deve essere di 2 lettere')
    .nullable(),
});

interface CustomerCreateProps extends PageProps {

}

const CustomerCreate: React.FC<CustomerCreateProps> = ({ auth, currentTenantId }) => {
  const formik: FormikConfig<Partial<Customer>> = {
    initialValues: {
      first_name: '',
      last_name: '',
      birth_date: null,
      gender: null,
      birthplace: '',
      tax_id_code: '',
      email: '',
      phone: '',
      street: '',
      number: '',
      city: '',
      zip: '',
      province: '',
      country: 'IT',
    },
    //validationSchema: customerValidationSchema,
    onSubmit: (values) => {
      // Handle form submission logic here
      //console.log('Form submitted with values:', values);
      // You can use router.post or router.put to send data to the server
      router.post(route('app.customers.store', {tenant: currentTenantId}), values as unknown as RequestPayload)
    }
  };
  return (
    <AppLayout user={auth.user} title="Nuovo cliente">
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={12} sx={{maxWidth: '900px', margin: '0 auto'}}>
          <MyCard>
            <Formik {...formik}>
              <CustomerForm formTitle="Crea nuovo cliente" />
            </Formik>
          </MyCard>
        </Grid>
      </Grid>
    </AppLayout>
    )
};

export default CustomerCreate
