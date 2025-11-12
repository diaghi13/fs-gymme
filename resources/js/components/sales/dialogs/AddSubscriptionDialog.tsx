import React from "react";
import {
  Button, Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle, Divider,
  List, ListItem, ListItemIcon, ListItemText, Stack,
} from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers";
import {PriceListSubscription, PriceListSubscriptionContent} from "@/types";

import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import CategoryIcon from '@mui/icons-material/Category';
import { ARTICLE, MEMBERSHIP } from '@/pages/price-lists/price-lists';
import { createCartItem, SaleRowFormValues } from '@/support/createCartItem';

interface AddSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  subscription: PriceListSubscription;
  onAdd: (arg0: SaleRowFormValues | SaleRowFormValues[] | undefined) => void;
}

export default function AddSubscriptionDialog({open, onClose, subscription, onAdd}: AddSubscriptionDialogProps) {
  //const [open, setOpen] = React.useState(true);
  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [standardContent] = React.useState<PriceListSubscriptionContent[]>(
    Array.isArray(subscription.standard_content) ? subscription.standard_content : []
  );
  const [optionalContent, setOptionalContent] = React.useState<PriceListSubscriptionContent[]>(
    Array.isArray(subscription.optional_content) ? subscription.optional_content.map(item => ({...item, selected:false})) : []
  );

  const handleClose = () => {
    onClose();
  };

  const handleChecked = (id: number) => {
    const index = optionalContent.indexOf(optionalContent.find(item => item.id === id) as PriceListSubscriptionContent);
    const prevState = [...optionalContent]
    prevState[index].selected = !prevState[index].selected;

    setOptionalContent(prevState);
  }

  const handleAdd = () => {
    const selectedOptions = optionalContent.filter(options => options.selected === true);
    onAdd(createCartItem(subscription, startDate, selectedOptions));
    handleClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={"sm"} fullWidth>
      <DialogTitle>{subscription.name}</DialogTitle>
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
        {standardContent.length > 0 && (
          <>
            <DialogContentText sx={{pt: 2, fontWeight: 600}}>Contenuto standard</DialogContentText>
            <List>
              {standardContent.map((product, index) => product && (
                <ListItem key={index}>
                  <ListItemIcon>
                    {product.price_listable_type === "App\\Models\\Product\\Product" && product.price_listable.type === "App\\Models\\Product\\BaseProduct" && <FitnessCenterIcon />}
                    {product.price_listable_type === "App\\Models\\Product\\Product" && product.price_listable.type === "App\\Models\\Product\\CourseProduct" && <SportsGymnasticsIcon />}
                    {product.price_listable_type === "App\\Models\\PriceList\\PriceList" && product.price_listable.type === MEMBERSHIP && <CardMembershipIcon />}
                    {product.price_listable_type === "App\\Models\\PriceList\\PriceList" && product.price_listable.type === ARTICLE && <CategoryIcon />}
                  </ListItemIcon>
                  <ListItemText
                    secondary={`€ ${parseFloat(String(product.price)).toFixed(2).replace(".", ",")}`}
                  >{product.price_listable.name}</ListItemText>
                </ListItem>
              ))}
            </List>
          </>
        )}
        {optionalContent.length > 0 && (
          <>
            <Divider />
            <Stack sx={{mt: 2}} display={"flex"} flexDirection={"row"} justifyContent={"space-between"}>
              <DialogContentText>Prodotti aggiuntivi</DialogContentText>
              <DialogContentText>Includi nell' offerta</DialogContentText>
            </Stack>
            <List>
              {optionalContent.map((option, index) => (
                <ListItem secondaryAction={<Checkbox checked={option.selected} onChange={() => handleChecked(option.id!)} />} key={index}>
                  <ListItemIcon>
                    <ListItemIcon>
                      {option.price_listable_type === "App\\Models\\Product\\Product" && option.price_listable.type === "App\\Models\\Product\\BaseProduct" && <FitnessCenterIcon />}
                      {option.price_listable_type === "App\\Models\\Product\\Product" && option.price_listable.type === "App\\Models\\Product\\CourseProduct" && <SportsGymnasticsIcon />}
                      {option.price_listable_type === "App\\Models\\PriceList\\PriceList" && option.price_listable.type === MEMBERSHIP && <CardMembershipIcon />}
                      {option.price_listable_type === "App\\Models\\PriceList\\PriceList" && option.price_listable.type === ARTICLE && <CategoryIcon />}
                    </ListItemIcon>
                  </ListItemIcon>
                  <ListItemText
                    secondary={`€ ${parseFloat(String(option.price)).toFixed(2).replace(".", ",")}`}
                  >{option.price_listable.name}</ListItemText>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annulla</Button>
        <Button variant={"contained"} onClick={handleAdd}>Aggiungi</Button>
      </DialogActions>
    </Dialog>
  );
};
