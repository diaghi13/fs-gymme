import * as React from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Box, Grid } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Formik, FormikConfig } from 'formik';
import { router, usePage } from '@inertiajs/react';
import UserCreateForm from '@/components/users/forms/UserCreateForm';
import * as Yup from 'yup';

interface UserCreateValues {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  send_invitation_email: boolean;
}

const validationSchema = Yup.object({
  first_name: Yup.string().required('Il nome è obbligatorio'),
  last_name: Yup.string().required('Il cognome è obbligatorio'),
  email: Yup.string().email('Email non valida').required('L\'email è obbligatoria'),
  role: Yup.string().required('Il ruolo è obbligatorio'),
});

const UserCreate: React.FC<PageProps> = ({ auth }) => {
  const { props } = usePage<PageProps>();
  const tenantId = props.currentTenantId;
  const formik: FormikConfig<UserCreateValues> = {
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      role: 'staff',
      send_invitation_email: true,
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      router.post(
        route('app.users.store', { tenant: tenantId }),
        values,
        {
          preserveScroll: true,
          onFinish: () => setSubmitting(false),
          onSuccess: () => {
            router.visit(
              route('app.users.index', { tenant: tenantId })
            );
          },
        }
      );
    },
  };

  return (
    <AppLayout user={auth.user}>
      <Box m={2}>
        <MyCard title="Invita nuovo utente">
          <Grid container spacing={2}>
            <Grid size={12}>
              <Formik {...formik}>
                <UserCreateForm />
              </Formik>
            </Grid>
          </Grid>
        </MyCard>
      </Box>
    </AppLayout>
  );
};

export default UserCreate;
