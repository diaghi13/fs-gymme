import * as React from 'react';
import { PageProps } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import { Box, Grid } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Formik, FormikConfig } from 'formik';
import CreateForm from '@/components/central/plan-features/CreateForm';
import { router } from '@inertiajs/react';

interface PlanFeatureFormValues {
  name: string;
  display_name: string;
  description: string;
  feature_type: 'boolean' | 'quota' | 'metered';
  is_active: boolean;
  is_addon_purchasable: boolean;
  default_addon_price: string; // MoneyTextField usa string
  default_addon_quota: number;
  sort_order: number;
}

interface CreateProps extends PageProps {
  featureTypes: Array<{ value: string; label: string }>;
}

const Create: React.FC<CreateProps> = ({ auth }) => {
  const formik: FormikConfig<PlanFeatureFormValues> = {
    initialValues: {
      name: '',
      display_name: '',
      description: '',
      feature_type: 'boolean',
      is_active: true,
      is_addon_purchasable: false,
      default_addon_price: '0',
      default_addon_quota: 0,
      sort_order: 0,
    },
    onSubmit: (values) => {
      router.post(
        route('central.plan-features.store'),
        values,
        {
          preserveScroll: true,
          onSuccess: () => {
            router.visit(route('central.plan-features.index'));
          },
          onError: (errors) => {
            console.error('Error creating feature:', errors);
          }
        }
      )
    }
  };

  return (
    <CentralLayout user={auth.user}>
      <Box m={2}>
        <MyCard title="Crea Feature">
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
