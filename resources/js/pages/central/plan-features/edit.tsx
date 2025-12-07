import * as React from 'react';
import { PageProps } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import { Box, Grid } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Formik, FormikConfig } from 'formik';
import CreateForm from '@/components/central/plan-features/CreateForm';
import { router } from '@inertiajs/react';

interface PlanFeature {
  id: number;
  name: string;
  display_name: string;
  description: string;
  feature_type: 'boolean' | 'quota' | 'metered';
  is_active: boolean;
  is_addon_purchasable: boolean;
  default_addon_price: number; // Dal backend arriva già in euro (MoneyCast)
  default_addon_quota: number;
  sort_order: number;
}

interface EditProps extends PageProps {
  feature: PlanFeature;
  featureTypes: Array<{ value: string; label: string }>;
}

const Edit: React.FC<EditProps> = ({ auth, feature }) => {
  const formik: FormikConfig<any> = {
    enableReinitialize: true,
    initialValues: {
      id: feature.id,
      name: feature.name,
      display_name: feature.display_name,
      description: feature.description || '',
      feature_type: feature.feature_type,
      is_active: feature.is_active,
      is_addon_purchasable: feature.is_addon_purchasable,
      // Backend già ritorna in euro grazie a MoneyCast, convertiamo solo a string per MoneyTextField
      default_addon_price: feature.default_addon_price
        ? feature.default_addon_price.toString()
        : '0',
      default_addon_quota: feature.default_addon_quota || 0,
      sort_order: feature.sort_order || 0,
    },
    onSubmit: (values, { setSubmitting }) => {
      router.patch(
        route('central.plan-features.update', feature.id),
        values,
        {
          preserveScroll: true,
          onFinish: () => setSubmitting(false),
          onError: (errors) => {
            console.error('Error updating feature:', errors);
          }
        }
      )
    }
  };

  return (
    <CentralLayout user={auth.user}>
      <Box m={2}>
        <MyCard title={`Modifica Feature: ${feature.display_name}`}>
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
