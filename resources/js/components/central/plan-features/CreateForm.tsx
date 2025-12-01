import * as React from 'react';
import { Form, useFormikContext } from 'formik';
import { Button, FormControlLabel, Grid, Stack } from '@mui/material';
import TextField from '@/components/ui/TextField';
import MoneyTextField from '@/components/ui/MoneyTextField';
import Select from '@/components/ui/Select';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import { router } from '@inertiajs/react';
import FormikSwitch from '@/components/ui/FormikSwitch';

interface PlanFeatureFormValues {
  name: string;
  display_name: string;
  description: string;
  feature_type: 'boolean' | 'quota' | 'metered';
  is_active: boolean;
  is_addon_purchasable: boolean;
  default_addon_price_cents: number;
  default_addon_quota: number;
  sort_order: number;
}

const CreateForm = () => {
  const { values } = useFormikContext<PlanFeatureFormValues>();

  return (
    <Form>
      <Grid container spacing={2}>
        <Grid size={6}>
          <TextField name="display_name" label="Nome Visualizzato" required />
        </Grid>
        <Grid size={6}>
          <TextField
            name="name"
            label="Codice Feature"
            required
            helperText="Identificatore univoco (es: max_users, storage_gb)"
          />
        </Grid>

        <Grid size={12}>
          <TextField name="description" label="Descrizione" multiline rows={3} />
        </Grid>

        <Grid size={4}>
          <Select
            name="feature_type"
            label="Tipo Feature"
            required
            options={[
              { value: 'boolean', label: 'Sì/No' },
              { value: 'quota', label: 'Con Quota' },
              { value: 'metered', label: 'A Consumo' }
            ]}
            helperText="Boolean: on/off, Quota: con limiti, Metered: pay-per-use"
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
        <Grid size={6} />

        {/* Addon Configuration */}
        <Grid size={12}>
          <FormControlLabel
            control={<FormikSwitch name="is_addon_purchasable" />}
            label="Acquistabile come Addon"
          />
        </Grid>

        {values.is_addon_purchasable && (
          <>
            <Grid size={4}>
              <MoneyTextField
                name="default_addon_price_cents"
                label="Prezzo Addon Default"
                helperText="Prezzo in euro"
              />
            </Grid>
            <Grid size={4}>
              <TextField
                name="default_addon_quota"
                label="Quota Addon Default"
                type="number"
                helperText="Quantità inclusa nell'addon"
              />
            </Grid>
            <Grid size={4} />
          </>
        )}

        {/* Status Switch */}
        <Grid size={12}>
          <FormControlLabel
            control={<FormikSwitch name="is_active" />}
            label="Feature Attiva"
          />
        </Grid>

        <Grid size={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => router.get(route("central.plan-features.index"))}>
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
