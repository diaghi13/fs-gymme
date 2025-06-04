import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers";
import {PriceListMembershipFee} from "@/types";
import { createCartItem, SaleRowFormValues } from '@/support/createCartItem';

interface AddMembershipFeeDialogProps {
  open: boolean;
  onClose: () => void;
  membershipFee: PriceListMembershipFee;
  onAdd: (arg0:  SaleRowFormValues | SaleRowFormValues[] | undefined) => void;
}

export default function AddMembershipFeeDialog({open, onClose, membershipFee, onAdd}: AddMembershipFeeDialogProps) {
  const [startDate, setStartDate] = React.useState<Date | null>(new Date());

  const handleClose = () => {
    onClose();
  };

  const handleAdd = () => {
    onAdd(createCartItem(membershipFee, startDate));
    handleClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={"sm"} fullWidth>
      <DialogTitle>{membershipFee.name}</DialogTitle>
      <DialogContent>
        <DatePicker
          label={"Data inizio abbonamento"}
          value={startDate}
          onChange={(value) => setStartDate(value)}
          slotProps={{textField: {variant: "standard"}}}
        />
        <DialogContentText sx={{pt: 2}}>
          La data di scadenza verrà calcolata automaticamente in base alla configurazione del prodotto
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annulla</Button>
        <Button variant={"contained"} onClick={handleAdd}>Aggiungi</Button>
      </DialogActions>
    </Dialog>
  );
};
