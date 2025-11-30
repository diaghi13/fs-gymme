import * as React from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Box, Grid } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Formik, FormikConfig } from 'formik';
import { router, usePage } from '@inertiajs/react';
import RoleEditForm from '@/components/users/forms/RoleEditForm';
import * as Yup from 'yup';

interface Permission {
  id: number;
  name: string;
  category: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
}

interface RoleEditProps extends PageProps {
  role: Role;
  all_permissions: Permission[];
  grouped_permissions: Record<string, Permission[]>;
}

interface RoleEditValues {
  name: string;
  description: string;
  permissions: number[];
}

const validationSchema = Yup.object({
  name: Yup.string().required('Il nome è obbligatorio'),
  description: Yup.string(),
  permissions: Yup.array().of(Yup.number()),
});

const RoleEdit: React.FC<RoleEditProps> = ({ auth, role, all_permissions, grouped_permissions }) => {
  const { props } = usePage<PageProps>();
  const tenantId = props.currentTenantId;
  const formik: FormikConfig<RoleEditValues> = {
    enableReinitialize: true,
    initialValues: {
      name: role.name,
      description: role.description || '',
      permissions: role.permissions.map((p) => p.id),
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      router.put(
        route('app.roles.update', {
          role: role.id,
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
        <MyCard title={`Modifica ruolo: ${role.name}`} subtitle={role.description}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Formik {...formik}>
                <RoleEditForm
                  roleId={role.id}
                  allPermissions={all_permissions}
                  groupedPermissions={grouped_permissions}
                />
              </Formik>
            </Grid>
          </Grid>
        </MyCard>
      </Box>
    </AppLayout>
  );
};

export default RoleEdit;
