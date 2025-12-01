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
        <Grid size={6}>
          <TextField
            name="slug"
            label="Slug (URL-friendly)"
            required
            helperText="Solo lettere minuscole, numeri e trattini (es: piano-base)"
          />
        </Grid>
        <Grid size={12}>
          <TextField name="description" label="Descrizione" multiline rows={4} />
        </Grid>

        {/* Pricing Section */}
        <Grid size={2}>
          <TextField
            name="price"
            label="Prezzo (centesimi)"
            type="number"
            required
            helperText="Es: 4900 = €49.00"
          />
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
          <TextField
            name="trial_days"
            label="Giorni di Prova"
            type="number"
            helperText="0-365 giorni"
          />
        </Grid>
        <Grid size={4} />

        {/* Tier and Classification */}
        <Grid size={3}>
          <Select
            name="tier"
            label="Livello Piano"
            options={[
              { value: '', label: 'Nessuno' },
              { value: 'base', label: 'Base' },
              { value: 'gold', label: 'Gold' },
              { value: 'platinum', label: 'Platinum' }
            ]}
          />
        </Grid>
        <Grid size={2}>
          <TextField
            name="sort_order"
            label="Ordine"
            type="number"
            helperText="Per ordinamento nella UI"
          />
        </Grid>
        <Grid size={7} />

        {/* Integration */}
        <Grid size={6}>
          <TextField
            name="stripe_price_id"
            label="Stripe Price ID"
            helperText="Es: price_1234567890"
          />
        </Grid>
        <Grid size={6} />

        {/* Switches */}
        <Grid size={12}>
          <Stack direction="row" spacing={3}>
            <FormControlLabel
              control={<FormikSwitch name="is_active" />}
              label="Attivo"
            />
            <FormControlLabel
              control={<FormikSwitch name="is_trial_plan" />}
              label="Piano di Prova"
            />
          </Stack>
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
