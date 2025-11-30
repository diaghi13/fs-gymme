import * as React from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Box, Grid } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Formik, FormikConfig } from 'formik';
import { router, usePage } from '@inertiajs/react';
import UserEditForm from '@/components/users/forms/UserEditForm';
import * as Yup from 'yup';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

interface UserEditProps extends PageProps {
  user: User;
}

interface UserEditValues {
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

const validationSchema = Yup.object({
  first_name: Yup.string().required('Il nome è obbligatorio'),
  last_name: Yup.string().required('Il cognome è obbligatorio'),
  email: Yup.string().email('Email non valida').required("L'email è obbligatoria"),
});

const UserEdit: React.FC<UserEditProps> = ({ auth, user }) => {
  const { props } = usePage<PageProps>();
  const tenantId = props.currentTenantId;
  const formik: FormikConfig<UserEditValues> = {
    enableReinitialize: true,
    initialValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_active: user.is_active,
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      router.patch(
        route('app.users.update', {
          user: user.id,
          tenant: tenantId,
        }),
        values,
        {
          preserveScroll: true,
          onFinish: () => setSubmitting(false),
        }
      );
    },
  };

  return (
    <AppLayout user={auth.user}>
      <Box m={2}>
        <MyCard
          title={`Modifica utente: ${user.first_name} ${user.last_name}`}
          subtitle={user.email}
        >
          <Grid container spacing={2}>
            <Grid size={12}>
              <Formik {...formik}>
                <UserEditForm userId={user.id} />
              </Formik>
            </Grid>
          </Grid>
        </MyCard>
      </Box>
    </AppLayout>
  );
};

export default UserEdit;
