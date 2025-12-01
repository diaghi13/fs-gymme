import * as React from 'react';
import { PageProps, SubscriptionPlan } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import { Box, Grid } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Formik, FormikConfig } from 'formik';
import CreateForm from '@/components/central/subscription-plans/CreateForm';
import FeaturesManager from '@/components/central/subscription-plans/FeaturesManager';
import { router } from '@inertiajs/react';

interface PlanFeature {
  id: number;
  name: string;
  display_name: string;
  feature_type: 'boolean' | 'quota' | 'metered';
  is_addon_purchasable: boolean;
  default_addon_price_cents: number | null;
  default_addon_quota: number | null;
}

interface AttachedFeature {
  id: number;
  name: string;
  display_name: string;
  feature_type: string;
  is_included: boolean;
  quota_limit: number | null;
  price_cents: number | null;
}

interface EditProps extends PageProps {
  subscriptionPlan: SubscriptionPlan;
  availableFeatures: PlanFeature[];
  planFeatures: AttachedFeature[];
}

const Edit: React.FC<EditProps> = ({ auth, subscriptionPlan, availableFeatures, planFeatures }) => {
  const formik: FormikConfig<any> = {
    enableReinitialize: true,
    initialValues: {
      name: subscriptionPlan.name,
      slug: subscriptionPlan.slug,
      description: subscriptionPlan.description,
      price: subscriptionPlan.price,
      currency: subscriptionPlan.currency,
      interval: subscriptionPlan.interval,
      trial_days: subscriptionPlan.trial_days ?? 0,
      tier: subscriptionPlan.tier ?? '',
      is_trial_plan: subscriptionPlan.is_trial_plan ?? false,
      is_active: subscriptionPlan.is_active ?? true,
      sort_order: subscriptionPlan.sort_order ?? 0,
      stripe_price_id: subscriptionPlan.stripe_price_id ?? '',
      features: planFeatures.map(f => ({
        feature_id: f.id,
        is_included: f.is_included,
        quota_limit: f.quota_limit,
        price_cents: f.price_cents,
      })),
    },
    onSubmit: (values, { setSubmitting }) => {
      router.patch(
        route('central.subscription-plans.update', subscriptionPlan.id),
        values,
        {
          preserveScroll: true,
          onFinish: () => setSubmitting(false),
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
        <Formik {...formik}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <MyCard title={`Modifica Piano: ${subscriptionPlan.name}`}>
                <CreateForm />
              </MyCard>
            </Grid>

            <Grid size={12}>
              <MyCard title="Gestione Features">
                <FeaturesManager
                  availableFeatures={availableFeatures}
                  currentFeatures={planFeatures}
                />
              </MyCard>
            </Grid>
          </Grid>
        </Formik>
      </Box>
    </CentralLayout>
  );
};

export default Edit;
