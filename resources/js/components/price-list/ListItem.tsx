import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItem as MuiListItem,
  IconButton
} from '@mui/material';
import React from 'react';
import { PriceListFolderTree, AllPriceLists } from '@/types';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { router } from '@inertiajs/react';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CategoryIcon from '@mui/icons-material/Category';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useTheme } from '@mui/material/styles';
import { ARTICLE, FOLDER, MEMBERSHIP, SUBSCRIPTION } from '@/pages/price-lists/price-lists';

interface ListItemProps {
  priceList: AllPriceLists;
  nested?: number;
  onClick: (priceList: Exclude<AllPriceLists, PriceListFolderTree>) => void;
  canCreate?: boolean;
}

export default function ListItem({ priceList, nested = 0, onClick, canCreate }: ListItemProps) {
  const [open, setOpen] = useLocalStorage(`priceLists.PRICE_LIST_FOLDER_${priceList.name}`, false);
  //const expandable = priceList.children?.length > 0
  const theme = useTheme();
  const expandable = priceList.type === FOLDER && priceList.children && priceList.children.length > 0;
  const isFolder = priceList.type === FOLDER;
  const color = priceList.type !== FOLDER
    ? priceList.color
    : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,1)' : 'rgba(0, 0, 0, 0.54)');

  const handleClick = () => {
    if (isFolder) {
      setOpen(!open);
    } else if (!expandable) {
      //router.get(`/price-lists/${priceList.id}`);
      onClick(priceList);
    }
  };

  return (
    <>
      {priceList.type === FOLDER && (
        <MuiListItem sx={{ pl: 2 + nested }}>
          <ListItemIcon>
            {open ? <FolderOpenIcon sx={{ mr: 1, color }} /> : <FolderIcon sx={{ mr: 1, color }} />}
          </ListItemIcon>
          <ListItemText primary={priceList.name} />
          {canCreate && priceList.type === FOLDER && (
            <IconButton
              onClick={() => router.get(route('price-lists.folders.show', { 'folder': priceList.id }))}
            >
              <MoreVertIcon />
            </IconButton>
          )}
          {expandable && (<IconButton onClick={handleClick}>{open ? <ExpandLess /> : <ExpandMore />}</IconButton>)}
        </MuiListItem>
      )}
      {priceList.type !== FOLDER && (
        <ListItemButton onClick={handleClick} sx={{ pl: 2 + nested }}>
          <ListItemIcon>
            {priceList.type === SUBSCRIPTION && <CreditCardIcon sx={{ mr: 1, color }} />}
            {priceList.type === ARTICLE && <CategoryIcon sx={{ mr: 1, color }} />}
            {priceList.type === MEMBERSHIP && <CardMembershipIcon sx={{ mr: 1, color }} />}
          </ListItemIcon>
          <ListItemText primary={priceList.name} />
          <IconButton onClick={handleClick}>{expandable && (open ? <ExpandLess /> : <ExpandMore />)}</IconButton>
        </ListItemButton>
      )}
      {expandable && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" dense disablePadding>
            {priceList.children && priceList.children.map((item: AllPriceLists, index) => (
              <ListItem priceList={item} key={index} nested={nested + 1} onClick={onClick} canCreate={canCreate} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};
