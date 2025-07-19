import * as React from 'react';
import { PageProps, SubscriptionPlan } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import { Box, Grid } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Formik, FormikConfig } from 'formik';
import CreateForm from '@/components/central/subscription-plans/CreateForm';
import { router } from '@inertiajs/react';

interface EditProps extends PageProps {
  subscriptionPlan: SubscriptionPlan;
}

const Edit: React.FC<EditProps> = ({ auth, subscriptionPlan }) => {
  const formik: FormikConfig<Partial<SubscriptionPlan>> = {
    initialValues: {
      name: subscriptionPlan.name,
      description: subscriptionPlan.description,
      price: subscriptionPlan.price,
      currency: subscriptionPlan.currency,
      interval: subscriptionPlan.interval,
      trial_days: subscriptionPlan.trial_days,
      is_active: subscriptionPlan.is_active
    },
    onSubmit: (values) => {
      router.patch(
        route('central.subscription-plans.update', subscriptionPlan.id),
        values,
        {
          preserveScroll: true,
          onSuccess: () => {
            router.visit(route('central.subscription-plans.index'));
          },
          onError: (errors) => {
            console.error('Error updating subscription plan:', errors);
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

export default Edit;
