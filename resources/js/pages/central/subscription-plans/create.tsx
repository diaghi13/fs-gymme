import * as React from 'react';
import { PageProps, SubscriptionPlan } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import { Box, Grid } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Formik, FormikConfig } from 'formik';
import CreateForm from '@/components/central/subscription-plans/CreateForm';
import { router } from '@inertiajs/react';

const Create: React.FC<PageProps> = ({ auth }) => {
  const formik: FormikConfig<Partial<SubscriptionPlan>> = {
    initialValues: {
      name: '',
      description: '',
      price: 0,
      currency: 'EUR',
      interval: 'monthly',
      trial_days: 0,
      is_active: true
    },
    onSubmit: (values) => {
      router.post(
        route('central.subscription-plans.store'),
        values,
        {
          preserveScroll: true,
          onSuccess: () => {
            router.visit(route('central.subscription-plans.index'));
          },
          onError: (errors) => {
            console.error('Error creating subscription plan:', errors);
          }
        }
      )
    }
  };

  return (
    <CentralLayout user={auth.user}>
      <Box m={2}>
        <MyCard title="Crea Piano di Abbonamento">
          <Grid container spacing={2}>
            <Grid size={12}>
              <Formik {...formik}>
                <CreateForm />
              </Formik>
            </Grid>
          </Grid>
        </MyCard>
      </Box>
    </CentralLayout>
  );
};

export default Create;
