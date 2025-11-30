import * as React from 'react';
import { Form, useFormikContext } from 'formik';
import {
  Alert,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  MenuItem,
  Switch,
  Typography,
} from '@mui/material';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import RoleBadge from '@/components/users/RoleBadge';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useRolePermissionLabels } from '@/hooks/useRolePermissionLabels';

interface UserCreateFormValues {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  send_invitation_email: boolean;
}

const UserCreateForm: React.FC = () => {
  const { values, setFieldValue, errors, touched } = useFormikContext<UserCreateFormValues>();
  const authorization = useAuthorization();
  const { getRole } = useRolePermissionLabels();

  // Define which roles the current user can assign
  const availableRoles = React.useMemo(() => {
    const baseRoles = ['staff', 'receptionist', 'trainer', 'back_office'];
    const roles = baseRoles.map((roleName) => {
      const roleInfo = getRole(roleName);
      return { value: roleName, label: roleInfo.label, description: roleInfo.description };
    });

    // Only owners and managers can assign manager role
    if (authorization.isOwner || authorization.isManager) {
      const managerInfo = getRole('manager');
      roles.push({
        value: 'manager',
        label: managerInfo.label,
        description: managerInfo.description,
      });
    }

    // Only owners can assign owner role
    if (authorization.isOwner) {
      const ownerInfo = getRole('owner');
      roles.push({
        value: 'owner',
        label: ownerInfo.label,
        description: ownerInfo.description,
      });
    }

    return roles;
  }, [authorization, getRole]);

  return (
    <Form>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid size={12}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Informazioni utente
          </Typography>
          <Divider />
        </Grid>

        <Grid size={12}>
          <Alert severity="info">
            L'utente riceverà un'email di invito con le istruzioni per accedere alla
            piattaforma. Se l'email è già registrata nel sistema centrale, verrà solo aggiunto
            a questo tenant con il ruolo selezionato.
          </Alert>
        </Grid>

        {/* Personal Info */}
        <Grid size={6}>
          <TextField label="Nome *" name="first_name" required autoFocus />
        </Grid>

        <Grid size={6}>
          <TextField label="Cognome *" name="last_name" required />
        </Grid>

        <Grid size={12}>
          <TextField
            label="Email *"
            name="email"
            type="email"
            required
            helperText="L'email sarà usata per l'accesso e per ricevere l'invito"
          />
        </Grid>

        {/* Role Selection */}
        <Grid size={12}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
            Ruolo e permessi
          </Typography>
          <Divider />
        </Grid>

        <Grid size={12}>
          <TextField
            select
            label="Ruolo *"
            name="role"
            required
            helperText="Il ruolo determina i permessi base dell'utente"
          >
            {availableRoles.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                <div>
                  <Typography variant="body1">{role.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {role.description}
                  </Typography>
                </div>
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {values.role && (
          <Grid size={12}>
            <Alert severity="info" icon={false}>
              <Typography variant="body2" gutterBottom>
                <strong>Ruolo selezionato:</strong>
              </Typography>
              <RoleBadge role={values.role} size="medium" showIcon={true} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {availableRoles.find((r) => r.value === values.role)?.description}
              </Typography>
            </Alert>
          </Grid>
        )}

        {/* Email Invitation */}
        <Grid size={12}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
            Notifica
          </Typography>
          <Divider />
        </Grid>

        <Grid size={12}>
          <FormControl component="fieldset">
            <FormControlLabel
              control={
                <Switch
                  checked={values.send_invitation_email}
                  onChange={(e) => setFieldValue('send_invitation_email', e.target.checked)}
                />
              }
              label="Invia email di invito"
            />
            <FormHelperText>
              {values.send_invitation_email
                ? 'L\'utente riceverà un\'email con le istruzioni per accedere'
                : 'L\'utente non riceverà alcuna notifica via email'}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Submit Button */}
        <Grid size={12}>
          <FormikSaveButton fullWidth size="large">
            Invita utente
          </FormikSaveButton>
        </Grid>
      </Grid>
    </Form>
  );
};

export default UserCreateForm;
