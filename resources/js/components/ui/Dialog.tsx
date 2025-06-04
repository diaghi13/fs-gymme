import * as React from 'react';
import Button from '@mui/material/Button';
import MuiDialog, {DialogProps as MuiDialogProps} from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

interface DialogPros extends MuiDialogProps {
  open: boolean;
  onClose: () => void;
  onAgree?: () => void;
  title?: string;
  hasActions?: boolean
}

export default function Dialog({open, onClose, onAgree, title = "", hasActions = true , children, ...props}: DialogPros) {

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
      {hasActions && (
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
