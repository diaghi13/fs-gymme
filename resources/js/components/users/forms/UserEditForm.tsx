import * as React from 'react';
import { Form, useFormikContext } from 'formik';
import {
  Alert,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Switch,
  Typography,
} from '@mui/material';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import { useAuthorization } from '@/hooks/useAuthorization';

interface UserEditFormValues {
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

interface UserEditFormProps {
  userId: number;
}

const UserEditForm: React.FC<UserEditFormProps> = ({ userId }) => {
  const { values, setFieldValue } = useFormikContext<UserEditFormValues>();
  const authorization = useAuthorization();

  return (
    <Form>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid size={12}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Informazioni personali
          </Typography>
          <Divider />
        </Grid>

        <Grid size={12}>
          <Alert severity="info">
            Modifica le informazioni generali dell'utente. Per cambiare il ruolo o i permessi,
            vai alla pagina di dettaglio utente.
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
            helperText="L'email è usata per l'accesso alla piattaforma"
          />
        </Grid>

        {/* Status */}
        {authorization.can('users.manage') && (
          <>
            <Grid size={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Stato account
              </Typography>
              <Divider />
            </Grid>

            <Grid size={12}>
              <FormControl component="fieldset">
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.is_active}
                      onChange={(e) => setFieldValue('is_active', e.target.checked)}
                    />
                  }
                  label={values.is_active ? 'Account attivo' : 'Account disattivato'}
                />
                <FormHelperText>
                  {values.is_active
                    ? "L'utente può accedere normalmente alla piattaforma"
                    : "L'utente non può più accedere alla piattaforma"}
                </FormHelperText>
              </FormControl>
            </Grid>

            {!values.is_active && (
              <Grid size={12}>
                <Alert severity="warning">
                  Attenzione: disattivando l'account, l'utente non potrà più effettuare il login.
                  Tutti i dati e le associazioni rimarranno intatti e potranno essere ripristinati
                  riattivando l'account.
                </Alert>
              </Grid>
            )}
          </>
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

export default UserEditForm;
