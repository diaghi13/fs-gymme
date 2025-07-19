import * as React from 'react';
import { Form} from 'formik';
import { Button, FormControlLabel, Grid, Stack } from '@mui/material';
import TextField from '@/components/ui/TextField';
import Select from '@/components/ui/Select';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import { router } from '@inertiajs/react';
import FormikSwitch from '@/components/ui/FormikSwitch';

const CreateForm = () => {

  return (
    <Form>
      <Grid container spacing={2}>
        <Grid size={6}>
          <TextField name="name" label="Nome del Piano" required />
        </Grid>
        <Grid size={6} />
        <Grid size={12}>
          <TextField name="description" label="Descrizione" multiline rows={4} />
        </Grid>
        <Grid size={2}>
          <TextField name="price" label="Prezzo" type="number" required />
        </Grid>
        <Grid size={1}>
          <TextField name="currency" label="Valuta" required />
        </Grid>
        <Grid size={3}>
          <Select
            name="interval"
            label="Intervallo di Fatturazione"
            options={[
              { value: 'monthly', label: 'Mensile' },
              { value: 'yearly', label: 'Annuale' },
              { value: 'weekly', label: 'Settimanale' },
              { value: 'daily', label: 'Giornaliero' }
            ]}
          />
        </Grid>
        <Grid size={2}>
          <TextField name="trial_days" label="Giorni di Prova" type="number" />
        </Grid>
        <Grid size={4} />
        <Grid size={12}>
          <FormControlLabel
            control={<FormikSwitch name="is_active" />}
            label="Attivo"
          />
        </Grid>
        <Grid size={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => router.get(route("central.subscription-plans.index"))}>
              Annulla
            </Button>
            <FormikSaveButton />
          </Stack>
        </Grid>
      </Grid>
    </Form>
  );
};

export default CreateForm;
