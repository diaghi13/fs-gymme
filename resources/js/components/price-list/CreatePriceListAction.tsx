import * as React from 'react';
import { Button, Divider, Grid, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ARTICLE, DAY_PASS, FOLDER, GIFT_CARD, MEMBERSHIP, PriceListPageProps, SUBSCRIPTION, TOKEN } from '@/pages/price-lists/price-lists';
import FolderIcon from '@mui/icons-material/Folder';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CategoryIcon from '@mui/icons-material/Category';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import StyleIcon from '@mui/icons-material/Style';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { router, usePage } from '@inertiajs/react';


const CreatePriceListAction = () => {
  const { currentTenantId } = usePage<PriceListPageProps>().props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreate = (type: string) => {
    switch (type) {
      case FOLDER:
        router.get(route('app.price-lists.create', {tenant: currentTenantId}));
        break;
      case MEMBERSHIP:
        router.get(route('app.price-lists.memberships.create', {tenant: currentTenantId}));
        break;
      case ARTICLE:
        router.get(route('app.price-lists.articles.create', {tenant: currentTenantId}));
        break;
      case DAY_PASS:
        router.get(route('app.price-lists.day-passes.create', {tenant: currentTenantId}));
        break;
      case TOKEN:
        router.get(route('app.price-lists.tokens.create', {tenant: currentTenantId}));
        break;
      case GIFT_CARD:
        router.get(route('app.price-lists.gift-cards.create', {tenant: currentTenantId}));
        break;
      case SUBSCRIPTION:
        router.get(route('app.price-lists.subscriptions.create', {tenant: currentTenantId}));
        break;
    }
    handleMenuClose();
  };

  return (
    <Grid size={12}>
      <Button
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleMenuOpen}
      >
        <AddIcon /> Aggiungi
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        <MenuItem onClick={() => {
          handleCreate(FOLDER);
        }}>
          <ListItemIcon>
            <FolderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            Nuovo listino
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          handleCreate(SUBSCRIPTION);
        }}>
          <ListItemIcon>
            <CreditCardIcon />
          </ListItemIcon>
          <ListItemText>
            Nuovo abbonamento
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleCreate(ARTICLE);
        }}>
          <ListItemIcon>
            <CategoryIcon />
          </ListItemIcon>
          <ListItemText>
            Nuovo articolo
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleCreate(MEMBERSHIP);
        }}>
          <ListItemIcon>
            <CardMembershipIcon />
          </ListItemIcon>
          <ListItemText>
            Nuova quota associativa
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleCreate(DAY_PASS);
        }}>
          <ListItemIcon>
            <ConfirmationNumberIcon />
          </ListItemIcon>
          <ListItemText>
            Nuovo Day Pass
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleCreate(TOKEN);
        }}>
          <ListItemIcon>
            <StyleIcon />
          </ListItemIcon>
          <ListItemText>
            Nuovo Token/Carnet
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleCreate(GIFT_CARD);
        }}>
          <ListItemIcon>
            <CardGiftcardIcon />
          </ListItemIcon>
          <ListItemText>
            Nuova Gift Card
          </ListItemText>
        </MenuItem>
      </Menu>
    </Grid>
  );
};

export default CreatePriceListAction;
