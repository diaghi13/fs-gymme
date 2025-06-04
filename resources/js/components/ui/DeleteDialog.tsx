import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Button, Dialog, DialogActions, DialogContentText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteDialog : React.FC<DeleteDialogProps> = ({open, onClose, onConfirm}) => {
  return (
    <Dialog
      open={open}
      keepMounted
      onClose={onClose}
      aria-describedby="alert-dialog-slide-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle align="center">{'Elimina'}</DialogTitle>
      <DialogContent sx={{textAlign: 'center'}}>
        <DialogContentText>
          <DeleteIcon sx={{fontSize: 40, color: 'error.main', mb: 4}}/>
        </DialogContentText>
        <DialogContentText id="alert-dialog-slide-description">
          Sei sicuro di volerlo eliminare?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{justifyContent: "center"}}>
        <Button onClick={onClose} sx={{width: "100%"}}>Annulla</Button>
        <Button onClick={onConfirm} variant="contained" color="error" sx={{width: "100%"}}>Elimina</Button>
      </DialogActions>
    </Dialog>
 );
};

export default DeleteDialog
