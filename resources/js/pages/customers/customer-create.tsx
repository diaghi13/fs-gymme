import * as React from 'react';
import { Customer, PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Formik, FormikConfig } from 'formik';
import CustomerForm from '@/components/customers/forms/CustomerForm';
import MyCard from '@/components/ui/MyCard';
import { Grid } from '@mui/material';

interface CustomerCreateProps extends PageProps {

}

const CustomerCreate: React.FC<CustomerCreateProps> = ({ auth }) => {
  const formik: FormikConfig<Partial<Customer>> = {
    initialValues: {
      first_name: '',
      last_name: '',
      birth_date: null,
      birthplace: '',
    },
    onSubmit: (values) => {
      // Handle form submission logic here
      console.log('Form submitted with values:', values);
      // You can use router.post or router.put to send data to the server
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
