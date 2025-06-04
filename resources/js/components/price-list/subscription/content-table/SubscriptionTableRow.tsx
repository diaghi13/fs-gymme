import React from 'react';
import { IconButton, Menu, MenuItem, Stack, TableCell, TableRow, Typography } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePage } from '@inertiajs/react';
import { MEMBERSHIP, PriceListPageProps } from '@/pages/price-lists/price-lists';
import {
  SubscriptionGeneralFormValuesWithContent
} from '@/components/price-list/subscription/tabs/SubscriptionGeneralTab';
import DeleteDialog from '@/components/ui/DeleteDialog';
import ExtraContentRow from '@/components/price-list/subscription/content-table/ExtraContentRow';

interface TableRowProps {
  content: SubscriptionGeneralFormValuesWithContent;
  onUpdate: () => void;
  onRemove: () => void;
}

export default function({ content, onUpdate, onRemove }: TableRowProps) {
  const { props: { vatRateOptions } } = usePage<PriceListPageProps>();
  const [expanded, setExpanded] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false);
  const menuOpen = Boolean(anchorEl);

  const isProduct = content.price_listable_type === 'App\\Models\\Product\\Product';
  const isMembership = content.price_listable.type === MEMBERSHIP

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  const handleVertClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleVertClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    toggleDeleteDialog();
    onRemove();
  }

  const toggleDeleteDialog = () => {
    handleVertClose()
    setDeleteDialogOpen(!deleteDialogOpen);
  }

  return (
    <>
      <TableRow>
        <TableCell colSpan={(!isProduct && !isMembership) ? 3 : 1}>
          {content.price_listable.name}
        </TableCell>
        {(isProduct || isMembership) && (
          <>
            <TableCell colSpan={isMembership ? 2 : 1}>
              {content.days_duration && `${content.days_duration} giorni `}
              {content.months_duration && `${content.months_duration} ${content.months_duration === 1 ? 'Mese' : 'Mesi'}`}
            </TableCell>
            {isProduct && (
              <TableCell>
                {content.entrances || 'Illimitati'}
              </TableCell>
            )}
          </>
        )}
        <TableCell sx={{ maxWidth: 100 }}>
          <Typography noWrap>
            {vatRateOptions?.find(item => content.vat_rate_id === item.value)?.label}
          </Typography>
        </TableCell>
        <TableCell>
          € {parseInt(String(content.price)).toFixed(2).replace('.', ',')}
        </TableCell>
        <TableCell sx={{ padding: 0 }}>
          <Stack display={'flex'} flexDirection={'row'} justifyContent={'end'}>
            <>
              {isProduct && <IconButton onClick={handleExpand}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>}
              <IconButton onClick={handleVertClick}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleVertClose}
              >
                <MenuItem onClick={onUpdate}><EditIcon sx={{ mr: 2 }} />Modifica</MenuItem>
                <MenuItem onClick={toggleDeleteDialog}><DeleteIcon sx={{ mr: 2 }} />Elimina</MenuItem>
              </Menu>
            </>
          </Stack>
        </TableCell>
      </TableRow>
      {expanded && (
        <ExtraContentRow content={ content } />
      )}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={toggleDeleteDialog}
        onConfirm={handleDelete}
      />
    </>
  );
};
