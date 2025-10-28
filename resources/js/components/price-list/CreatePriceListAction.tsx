import * as React from 'react';
import { Button, Divider, Grid, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ARTICLE, FOLDER, MEMBERSHIP, PriceListPageProps, SUBSCRIPTION } from '@/pages/price-lists/price-lists';
import FolderIcon from '@mui/icons-material/Folder';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CategoryIcon from '@mui/icons-material/Category';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
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
      </Menu>
    </Grid>
  );
};

export default CreatePriceListAction;
