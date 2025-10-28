import React from 'react';
import { Form, useFormikContext } from 'formik';
import { Button, Grid } from '@mui/material';
import TextField from '@/components/ui/TextField';
import ColorInput from '@/components/ui/ColorInput';
import FormikSaveButton from '@/components/ui/FormikSaveButton';

interface GeneralFormProps {
  onDismiss: () => void;
}

export default function GeneralForm({ onDismiss }: GeneralFormProps) {
  const { values, setFieldValue } = useFormikContext<{
    name: string;
    color: string;
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
        <Grid size={12}>
          <ColorInput label={'Colore *'} name="color" required />
        </Grid>
        <Grid size={12}>
          <Button onClick={() => {
            setFieldValue('is_active', !values.is_active);
          }}>
            {values.is_active
              ? 'Rimuovi prodotto dalle liste'
              : 'Visualizza prodotto nelle liste'}
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
