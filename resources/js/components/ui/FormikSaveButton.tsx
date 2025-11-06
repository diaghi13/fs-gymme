import { Button, CircularProgress } from '@mui/material';
import React from 'react';
import { useFormikContext } from 'formik';
import SaveIcon from '@mui/icons-material/Save';

export default function FormikSaveButton() {
  const formik = useFormikContext();

  return (
    <Button
      size="small"
      variant="contained"
      type="submit"
      disabled={!formik.dirty || formik.isSubmitting}
      startIcon={formik.isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
    >
      {formik.isSubmitting ? 'Salvataggio...' : 'Salva'}
    </Button>
  );
}
