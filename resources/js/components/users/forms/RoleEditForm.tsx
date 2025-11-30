import * as React from 'react';
import { Form, useFormikContext } from 'formik';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckAllIcon,
  Cancel as UncheckAllIcon,
} from '@mui/icons-material';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';

interface Permission {
  id: number;
  name: string;
  category: string;
}

interface RoleEditFormValues {
  name: string;
  description: string;
  permissions: number[];
}

interface RoleEditFormProps {
  roleId: number;
  allPermissions: Permission[];
  groupedPermissions: Record<string, Permission[]>;
}

const categoryLabels: Record<string, string> = {
  sales: 'Vendite',
  customers: 'Clienti',
  products: 'Prodotti',
  pricelists: 'Listini prezzi',
  reports: 'Report',
  settings: 'Impostazioni',
  users: 'Utenti',
  training: 'Allenamenti',
  checkin: 'Check-in',
};

const categoryDescriptions: Record<string, string> = {
  sales: 'Gestione vendite, fatturazione elettronica, pagamenti',
  customers: 'Visualizzazione e modifica anagrafica clienti, dati finanziari',
  products: 'Creazione e modifica prodotti, servizi, corsi',
  pricelists: 'Gestione listini prezzi, abbonamenti, pacchetti',
  reports: 'Accesso report vendite, clienti, statistiche',
  settings: 'Configurazione aziendale, fatturazione, IVA, email',
  users: 'Gestione utenti, ruoli, permessi',
  training: 'Gestione allenamenti e schede clienti assegnati',
  checkin: 'Check-in clienti in ingresso',
};

const RoleEditForm: React.FC<RoleEditFormProps> = ({
  roleId,
  allPermissions,
  groupedPermissions,
}) => {
  const { values, setFieldValue } = useFormikContext<RoleEditFormValues>();

  const handleTogglePermission = (permissionId: number) => {
    const currentPermissions = values.permissions || [];
    if (currentPermissions.includes(permissionId)) {
      setFieldValue(
        'permissions',
        currentPermissions.filter((id) => id !== permissionId)
      );
    } else {
      setFieldValue('permissions', [...currentPermissions, permissionId]);
    }
  };

  const handleSelectAllInCategory = (categoryPermissions: Permission[]) => {
    const currentPermissions = values.permissions || [];
    const categoryIds = categoryPermissions.map((p) => p.id);
    const allSelected = categoryIds.every((id) => currentPermissions.includes(id));

    if (allSelected) {
      // Deselect all in category
      setFieldValue(
        'permissions',
        currentPermissions.filter((id) => !categoryIds.includes(id))
      );
    } else {
      // Select all in category
      const newPermissions = [...new Set([...currentPermissions, ...categoryIds])];
      setFieldValue('permissions', newPermissions);
    }
  };

  const isCategoryFullySelected = (categoryPermissions: Permission[]) => {
    const currentPermissions = values.permissions || [];
    return categoryPermissions.every((p) => currentPermissions.includes(p.id));
  };

  const getCategorySelectedCount = (categoryPermissions: Permission[]) => {
    const currentPermissions = values.permissions || [];
    return categoryPermissions.filter((p) => currentPermissions.includes(p.id)).length;
  };

  return (
    <Form>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid size={12}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Informazioni ruolo
          </Typography>
          <Divider />
        </Grid>

        <Grid size={12}>
          <Alert severity="info">
            Modifica il nome, la descrizione e i permessi del ruolo. Gli utenti con questo ruolo
            riceveranno automaticamente tutti i permessi selezionati.
          </Alert>
        </Grid>

        {/* Role Info */}
        <Grid size={12}>
          <TextField
            label="Nome ruolo *"
            name="name"
            required
            helperText="Identificativo univoco del ruolo"
            disabled
          />
        </Grid>

        <Grid size={12}>
          <TextField
            label="Descrizione"
            name="description"
            multiline
            rows={2}
            helperText="Breve descrizione delle responsabilità del ruolo"
          />
        </Grid>

        {/* Permissions Section */}
        <Grid size={12}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
            Permessi ({values.permissions?.length || 0}/{allPermissions.length})
          </Typography>
          <Divider />
        </Grid>

        <Grid size={12}>
          <Stack spacing={1}>
            {Object.entries(groupedPermissions).map(([category, permissions]) => {
              const isFullySelected = isCategoryFullySelected(permissions);
              const selectedCount = getCategorySelectedCount(permissions);

              return (
                <Accordion key={category} defaultExpanded={selectedCount > 0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ width: '100%', pr: 2 }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {categoryLabels[category] || category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {categoryDescriptions[category] || ''}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color={selectedCount > 0 ? 'primary' : 'text.secondary'}
                        fontWeight={600}
                      >
                        {selectedCount}/{permissions.length}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1}>
                      <Button
                        size="small"
                        startIcon={isFullySelected ? <UncheckAllIcon /> : <CheckAllIcon />}
                        onClick={() => handleSelectAllInCategory(permissions)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        {isFullySelected ? 'Deseleziona tutti' : 'Seleziona tutti'}
                      </Button>

                      <FormControl component="fieldset">
                        <FormGroup>
                          {permissions.map((permission) => (
                            <FormControlLabel
                              key={permission.id}
                              control={
                                <Checkbox
                                  checked={values.permissions?.includes(permission.id) || false}
                                  onChange={() => handleTogglePermission(permission.id)}
                                />
                              }
                              label={
                                <Typography variant="body2">
                                  {permission.name.split('.')[1]}
                                </Typography>
                              }
                            />
                          ))}
                        </FormGroup>
                      </FormControl>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        </Grid>

        {values.permissions?.length === 0 && (
          <Grid size={12}>
            <Alert severity="warning">
              Attenzione: nessun permesso selezionato. Gli utenti con questo ruolo non potranno
              accedere a nessuna funzionalità.
            </Alert>
          </Grid>
        )}

        {/* Submit Button */}
        <Grid size={12}>
          <FormikSaveButton fullWidth size="large">
            Salva modifiche
          </FormikSaveButton>
        </Grid>
      </Grid>
    </Form>
  );
};

export default RoleEditForm;
