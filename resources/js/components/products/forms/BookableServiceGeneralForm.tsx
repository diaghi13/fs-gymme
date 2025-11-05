import React from 'react';
import { Form, useFormikContext } from 'formik';
import { Button, Grid } from '@mui/material';
import TextField from '@/components/ui/TextField';
import ColorInput from '@/components/ui/ColorInput';
import FormikSaveButton from '@/components/ui/FormikSaveButton';

interface GeneralFormProps {
  onDismiss: () => void;
}

export default function BookableServiceGeneralForm({ onDismiss }: GeneralFormProps) {
  const { values, setFieldValue } = useFormikContext<{
    name: string;
    color: string;
    description: string;
    short_description: string;
    duration_minutes: number;
    requires_trainer: boolean;
    is_active: boolean;
  }>();

  return (
    <Form>
      <Grid container spacing={4}>
        <Grid size={12}>
          <TextField
            label="Nome *"
            name="name"
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Durata (minuti) *"
            name="duration_minutes"
            type="number"
          />
        </Grid>
        <Grid size={6}>
          <ColorInput label={'Colore *'} name="color" required />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Descrizione breve"
            name="short_description"
            multiline
            rows={2}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Descrizione"
            name="description"
            multiline
            rows={4}
          />
        </Grid>
        <Grid size={12}>
          <Button onClick={() => {
            setFieldValue('requires_trainer', !values.requires_trainer);
          }}>
            {values.requires_trainer
              ? 'Rimuovi requisito trainer'
              : 'Richiedi trainer'}
          </Button>
        </Grid>
        <Grid size={12}>
          <Button onClick={() => {
            setFieldValue('is_active', !values.is_active);
          }}>
            {values.is_active
              ? 'Rimuovi servizio dalle liste'
              : 'Visualizza servizio nelle liste'}
          </Button>
        </Grid>
        <Grid size={12} sx={{ textAlign: 'end' }}>
          <Button size="small" sx={{ marginRight: 2 }} onClick={onDismiss}>Annulla</Button>
          <FormikSaveButton />
        </Grid>
      </Grid>
    </Form>
  );
};