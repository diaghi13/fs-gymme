import * as React from 'react';
import Button from '@mui/material/Button';
import MuiDialog, { DialogProps as MuiDialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import { useFormikContext } from 'formik';

interface DialogPros extends MuiDialogProps {
  open: boolean;
  onClose: () => void;
  onAgree?: () => void;
  title?: string;
  hasActions?: boolean;
  isForm?: boolean;
}

export default function Dialog(
  {
    open,
    onClose,
    onAgree,
    title = '',
    hasActions = true,
    children,
    isForm = false,
    ...props
  }: DialogPros) {
  const formik = useFormikContext();

  const handleClose = () => {
    onClose();
  };

  return (
    <MuiDialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      {...props}
    >
      <DialogTitle id="alert-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
      {hasActions && isForm && (
        <DialogActions sx={{ p: 2 }}>
          <Button size="small" sx={{ marginRight: 2 }} onClick={onClose}>Annulla</Button>
          <Button size="small" variant="contained" type="submit" disabled={!formik.dirty} onClick={formik.submitForm}>Salva</Button>
        </DialogActions>
      )}
      {hasActions && !isForm && (
        <DialogActions>
          <Button onClick={handleClose}>Annulla</Button>
          <Button onClick={onAgree} autoFocus>
            Conferma
          </Button>
        </DialogActions>
      )}
    </MuiDialog>
  );
}
