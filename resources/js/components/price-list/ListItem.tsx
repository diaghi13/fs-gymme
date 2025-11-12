import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItem as MuiListItem,
  IconButton,
  useTheme
} from '@mui/material';
import React from 'react';
import { PriceListFolderTree, AllPriceLists } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { router, usePage } from '@inertiajs/react';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import StyleIcon from '@mui/icons-material/Style';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CategoryIcon from '@mui/icons-material/Category';
import { ARTICLE, DAY_PASS, FOLDER, GIFT_CARD, MEMBERSHIP, PriceListPageProps, SUBSCRIPTION, TOKEN } from '@/pages/price-lists/price-lists';

interface ListItemProps {
  priceList: AllPriceLists;
  nested?: number;
  onClick: (priceList: Exclude<AllPriceLists, PriceListFolderTree>) => void;
  canCreate?: boolean;
}

export default function ListItem({ priceList, nested = 0, onClick, canCreate }: ListItemProps) {
  const [open, setOpen] = useLocalStorage(`priceLists.PRICE_LIST_FOLDER_${priceList.name}`, false);
  const theme = useTheme();
  const expandable = priceList.type === FOLDER && priceList.children && priceList.children.length > 0;
  const isFolder = priceList.type === FOLDER;
  const color = priceList.type !== FOLDER
    ? priceList.color
    : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,1)' : 'rgba(0, 0, 0, 0.54)');

  const page = usePage<PriceListPageProps>().props;

  const handleClick = () => {
    if (isFolder) {
      setOpen(!open);
    } else {
      onClick(priceList as Exclude<AllPriceLists, PriceListFolderTree>);
    }
  };

  return (
    <>
      {priceList.type === FOLDER && (
        <>
          <MuiListItem sx={{ pl: 2 + nested }}>
            <ListItemIcon>
              {open ? <FolderOpenIcon sx={{ color }} /> : <FolderIcon sx={{ color }} />}
            </ListItemIcon>
            <ListItemText primary={priceList.name} />
            {canCreate && (
              <IconButton
                onClick={() => router.get(route('app.price-lists.folders.show', { 'tenant': page.currentTenantId, 'folder': priceList.id }))}
              >
                <MoreVertIcon />
              </IconButton>
            )}
            {expandable && (
              <IconButton onClick={handleClick}>
                {open ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </MuiListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" dense disablePadding>
              {priceList.children && priceList.children.map((item: AllPriceLists, index) => (
                <ListItem priceList={item} key={index} nested={nested + 1} onClick={onClick} canCreate={canCreate} />
              ))}
            </List>
          </Collapse>
        </>
      )}
      {priceList.type !== FOLDER && (
        <ListItemButton onClick={handleClick} sx={{ pl: 2 + nested }}>
          <ListItemIcon>
            {priceList.type === MEMBERSHIP && <CardMembershipIcon sx={{ color }} />}
            {priceList.type === TOKEN && <StyleIcon sx={{ color }} />}
            {priceList.type === DAY_PASS && <ConfirmationNumberIcon sx={{ color }} />}
            {priceList.type === GIFT_CARD && <CardGiftcardIcon sx={{ color }} />}
            {priceList.type === SUBSCRIPTION && <CreditCardIcon sx={{ color }} />}
            {priceList.type === ARTICLE && <CategoryIcon sx={{ color }} />}
          </ListItemIcon>
          <ListItemText primary={priceList.name} />
        </ListItemButton>
      )}
    </>
  );
}

