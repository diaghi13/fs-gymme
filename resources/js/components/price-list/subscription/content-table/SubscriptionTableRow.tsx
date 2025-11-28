import React from 'react';
import { IconButton, Menu, MenuItem, Stack, TableCell, TableRow, Typography } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePage } from '@inertiajs/react';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';
import {
  SubscriptionGeneralFormValuesWithContent
} from '@/components/price-list/subscription/tabs/SubscriptionGeneralTab';
import DeleteDialog from '@/components/ui/DeleteDialog';
import ExtraContentRow from '@/components/price-list/subscription/content-table/ExtraContentRow';
import { SUBSCRIPTION_CONTENT_TYPES } from '@/constants/subscriptionContentTypes';

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

  // Check if it's a Product (includes BaseProduct, CourseProduct, BookableService)
  const isProduct = content.price_listable_type?.includes('Product\\');
  const isMembership = content.price_listable_type === SUBSCRIPTION_CONTENT_TYPES.MEMBERSHIP;
  const isToken = content.price_listable_type === SUBSCRIPTION_CONTENT_TYPES.TOKEN;
  const isGiftCard = content.price_listable_type === SUBSCRIPTION_CONTENT_TYPES.GIFT_CARD;

  // Token and GiftCard show duration + entrances (for token)
  const showDuration = isProduct || isMembership || isToken || isGiftCard;
  const showEntrances = isProduct || isToken;

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
        <TableCell colSpan={showDuration ? 1 : 3}>
          {content.price_listable.name}
        </TableCell>
        {showDuration && (
          <TableCell colSpan={showEntrances ? 1 : 2}>
            {content.days_duration ? `${content.days_duration} giorni ` : ''}
            {content.months_duration ? `${content.months_duration} ${content.months_duration === 1 ? 'Mese' : 'Mesi'}` : ''}
            {!content.days_duration && !content.months_duration && '—'}
          </TableCell>
        )}
        {showEntrances && (
          <TableCell>
            {content.entrances || 'Illimitati'}
          </TableCell>
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
