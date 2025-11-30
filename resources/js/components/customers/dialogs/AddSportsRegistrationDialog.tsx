import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
} from '@mui/material';
import { Customer, SportsRegistration } from '@/types';
import { Formik, Form } from 'formik';
import TextField from '@/components/ui/TextField';
import DatePicker from '@/components/ui/DatePicker';
import axios from 'axios';
import { route } from 'ziggy-js';

interface AddSportsRegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  customer: Customer;
  registration: SportsRegistration | null;
  onSuccess: () => void;
}

interface RegistrationFormValues {
  organization: string;
  membership_number: string;
  start_date: string;
  end_date: string;
  notes: string;
}

// Common Italian sports organizations
const ORGANIZATIONS = [
  'ASI - Associazioni Sportive Sociali Italiane',
  'CONI - Comitato Olimpico Nazionale Italiano',
  'FIF - Federazione Italiana Fitness',
  'FIPE - Federazione Italiana Pesistica',
  'FIJLKAM - Federazione Italiana Judo Lotta Karate Arti Marziali',
  'FIT - Federazione Italiana Tennis',
  'FIN - Federazione Italiana Nuoto',
  'FGI - Federazione Ginnastica d\'Italia',
  'FIDAL - Federazione Italiana di Atletica Leggera',
  'FIGC - Federazione Italiana Giuoco Calcio',
  'Altro',
];

const AddSportsRegistrationDialog: React.FC<AddSportsRegistrationDialogProps> = ({
  open,
  onClose,
  customer,
  registration,
  onSuccess,
}) => {
  const initialValues: RegistrationFormValues = {
    organization: registration?.organization || '',
    membership_number: registration?.membership_number || '',
    start_date: registration?.start_date
      ? (typeof registration.start_date === 'string'
          ? registration.start_date
          : new Date(registration.start_date).toISOString().split('T')[0])
      : new Date().toISOString().split('T')[0],
    end_date: registration?.end_date
      ? (typeof registration.end_date === 'string'
          ? registration.end_date
          : new Date(registration.end_date).toISOString().split('T')[0])
      : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    notes: registration?.notes || '',
  };

  const handleSubmit = async (values: RegistrationFormValues) => {
    try {
      if (registration) {
        await axios.put(
          route('api.v1.customers.sports-registrations.update', {
            customer: customer.id,
            registration: registration.id,
          }),
          values
        );
      } else {
        await axios.post(
          route('api.v1.customers.sports-registrations.store', {
            customer: customer.id,
          }),
          values
        );
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving sports registration:', error);
      alert('Errore nel salvataggio del tesseramento');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {registration ? 'Modifica Tesseramento' : 'Nuovo Tesseramento'}
      </DialogTitle>

      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {() => (
          <Form>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    name="organization"
                    label="Ente Sportivo *"
                    select
                    helperText="Seleziona l'ente sportivo di riferimento"
                  >
                    {ORGANIZATIONS.map((org) => (
                      <MenuItem key={org} value={org}>
                        {org}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={12}>
                  <TextField
                    name="membership_number"
                    label="Numero Tessera"
                    helperText="Numero identificativo tessera (opzionale)"
                  />
                </Grid>

                <Grid size={6}>
                  <DatePicker
                    name="start_date"
                    label="Data Inizio *"
                  />
                </Grid>

                <Grid size={6}>
                  <DatePicker
                    name="end_date"
                    label="Data Scadenza *"
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    name="notes"
                    label="Note"
                    multiline
                    rows={3}
                    helperText="Eventuali note o informazioni aggiuntive"
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={onClose}>Annulla</Button>
              <Button type="submit" variant="contained">
                {registration ? 'Aggiorna' : 'Salva'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddSportsRegistrationDialog;

