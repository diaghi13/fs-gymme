import React from 'react';
import { Form, useFormikContext } from 'formik';
import { Button, Grid } from '@mui/material';
import TextField from '@/components/ui/TextField';
import ColorInput from '@/components/ui/ColorInput';
import FormikSaveButton from '@/components/ui/FormikSaveButton';

interface OnlineFormProps {
  onDismiss: () => void;
}

export default function OnlineForm({ onDismiss }: OnlineFormProps) {
  return (
    <Form>
      <Grid container spacing={4}>
        <Grid size={12}>
          <TextField label="Descrizione" name="description" multiline rows={1} />
        </Grid>
        <Grid size={12}>
          <TextField label="Descrizione breve" name="short_description" multiline rows={1} />
        </Grid>
        <Grid size={12} sx={{ textAlign: 'end' }}>
          <Button size="small" sx={{ marginRight: 2 }} onClick={onDismiss}>Annulla</Button>
          <FormikSaveButton />
        </Grid>
      </Grid>
    </Form>
  );
};
