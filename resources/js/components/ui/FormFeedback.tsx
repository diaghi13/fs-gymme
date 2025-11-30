import React from 'react';
import { Alert, AlertTitle, Snackbar, LinearProgress, Box } from '@mui/material';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface FormFeedbackProps {
  isSubmitting?: boolean;
}

export default function FormFeedback({ isSubmitting = false }: FormFeedbackProps) {
  const { flash } = usePage<PageProps>().props as any;
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (flash?.status) {
      setOpen(true);
    }
  }, [flash]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {isSubmitting && (
        <Box sx={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
          <LinearProgress />
        </Box>
      )}

      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={flash?.status === 'success' ? 'success' : 'error'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {flash?.message && <AlertTitle>{flash.status === 'success' ? 'Successo' : 'Errore'}</AlertTitle>}
          {flash?.message || 'Operazione completata'}
        </Alert>
      </Snackbar>
    </>
  );
}
