import { Button, CircularProgress } from '@mui/material';
import React from 'react';
import { useFormikContext } from 'formik';
import SaveIcon from '@mui/icons-material/Save';

interface FormikSaveButtonProps {
  loading?: boolean;
  children?: React.ReactNode;
}

export default function FormikSaveButton({ loading, children }: FormikSaveButtonProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formik = useFormikContext<any>();
  const isSubmitting = loading ?? formik.isSubmitting;
  const disabled = !formik.dirty || isSubmitting;

  return (
    <Button
      size="small"
      variant="contained"
      type="submit"
      disabled={disabled}
      startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
    >
      {isSubmitting ? 'Salvataggio...' : (children ?? 'Salva')}
    </Button>
  );
}
