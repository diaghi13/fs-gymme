import * as React from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Box, Grid } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Formik, FormikConfig } from 'formik';
import { router, usePage } from '@inertiajs/react';
import * as Yup from 'yup';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRolePermissionLabels } from '@/hooks/useRolePermissionLabels';

interface Permission {
  name: string;
  label: string;
}

interface PermissionCategory {
  category: string;
  permissions: Permission[];
}

interface RoleCreateProps extends PageProps {
  permissions: PermissionCategory[];
}

interface RoleCreateValues {
  name: string;
  permissions: string[];
}

const validationSchema = Yup.object({
  name: Yup.string().required('Il nome del ruolo è obbligatorio'),
  permissions: Yup.array().of(Yup.string()),
});

const RoleCreate: React.FC<RoleCreateProps> = ({ auth, permissions }) => {
  const { getCategoryLabel } = useRolePermissionLabels();
  const { props } = usePage<PageProps>();
  const tenantId = props.currentTenantId;

  const formik: FormikConfig<RoleCreateValues> = {
    initialValues: {
      name: '',
      permissions: [],
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      router.post(
        route('app.roles.store', { tenant: tenantId }),
        values,
        {
          preserveScroll: true,
          onFinish: () => setSubmitting(false),
        }
      );
    },
  };

  return (
    <AppLayout title="Crea Ruolo">
      <Box sx={{ p: 3 }}>
        <Formik {...formik}>
          {({ values, errors, touched, handleChange, handleSubmit, isSubmitting, setFieldValue }) => {
            const handleSelectAllInCategory = (categoryPermissions: Permission[]) => {
              const categoryPermissionNames = categoryPermissions.map((p) => p.name);
              const allSelected = categoryPermissionNames.every((name) =>
                values.permissions.includes(name)
              );

              if (allSelected) {
                // Deselect all in category
                setFieldValue(
                  'permissions',
                  values.permissions.filter((p) => !categoryPermissionNames.includes(p))
                );
              } else {
                // Select all in category
                const newPermissions = [...values.permissions];
                categoryPermissionNames.forEach((name) => {
                  if (!newPermissions.includes(name)) {
                    newPermissions.push(name);
                  }
                });
                setFieldValue('permissions', newPermissions);
              }
            };

            return (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <MyCard title="Informazioni Ruolo">
                      <Stack spacing={3}>
                        <TextField
                          fullWidth
                          label="Nome Ruolo"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          placeholder="es. Assistente Front Desk"
                        />

                        <Typography variant="body2" color="text.secondary">
                          Scegli un nome descrittivo per il ruolo. I ruoli di sistema (Owner, Manager, etc.)
                          non possono essere modificati.
                        </Typography>
                      </Stack>
                    </MyCard>
                  </Grid>

                  <Grid size={12}>
                    <MyCard title="Permessi">
                      <Stack spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          Seleziona i permessi da assegnare a questo ruolo. Gli utenti con questo ruolo
                          avranno accesso solo alle funzionalità selezionate.
                        </Typography>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {values.permissions.length} permessi selezionati
                          </Typography>
                        </Box>

                        {permissions.map(({ category, permissions: categoryPermissions }) => {
                          const selectedCount = categoryPermissions.filter((p) =>
                            values.permissions.includes(p.name)
                          ).length;
                          const isFullySelected = selectedCount === categoryPermissions.length;

                          return (
                            <Accordion key={category}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                                  <Typography>{getCategoryLabel(category)}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    ({selectedCount}/{categoryPermissions.length})
                                  </Typography>
                                </Stack>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Stack spacing={2}>
                                  <Button
                                    size="small"
                                    onClick={() => handleSelectAllInCategory(categoryPermissions)}
                                  >
                                    {isFullySelected ? 'Deseleziona tutti' : 'Seleziona tutti'}
                                  </Button>

                                  <FormGroup>
                                    {categoryPermissions.map((permission) => (
                                      <FormControlLabel
                                        key={permission.name}
                                        control={
                                          <Checkbox
                                            checked={values.permissions.includes(permission.name)}
                                            onChange={(e) => {
                                              const newPermissions = e.target.checked
                                                ? [...values.permissions, permission.name]
                                                : values.permissions.filter((p) => p !== permission.name);
                                              setFieldValue('permissions', newPermissions);
                                            }}
                                          />
                                        }
                                        label={permission.label}
                                      />
                                    ))}
                                  </FormGroup>
                                </Stack>
                              </AccordionDetails>
                            </Accordion>
                          );
                        })}
                      </Stack>
                    </MyCard>
                  </Grid>

                  <Grid size={12}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        onClick={() => router.get(route('app.roles.index', { tenant: tenantId }))}
                      >
                        Annulla
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Creazione...' : 'Crea Ruolo'}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </form>
            );
          }}
        </Formik>
      </Box>
    </AppLayout>
  );
};

export default RoleCreate;
