import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  LinearProgress, LinearProgressProps,
  ListItem,
  Typography
} from '@mui/material';
import { Subscription } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import FormattedDate from '@/components/ui/FormattedDate';

import EditIcon from '@mui/icons-material/Edit';
import EditSubscriptionDialog from '@/components/customers/dialogs/EditSubscriptionDialog';
import { PageProps } from '@/types';

interface SubscriptionItemProps {
  subscription: Subscription; // Replace 'any' with the actual type of your subscription item
  index: number; // Add index prop to identify the item in the list
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ subscription, index }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { currentTenantId } = usePage<PageProps>().props;

  const start: Date = new Date(subscription.start_date);
  const end: Date | "" = subscription.end_date ? new Date(subscription.end_date) : "";
  const effectiveEnd: Date | "" = subscription.effective_end_date ? new Date(subscription.effective_end_date) : end;
  const today: Date = new Date();

  // Use effective_end_date for percentage calculation
  const percentage = effectiveEnd ? Math.round(
    ((today.getTime() - start.getTime()) / (effectiveEnd.getTime() - start.getTime())) * 100
  ) : 0;

  const barColor: LinearProgressProps['color'] =
    percentage > 90
      ? 'error'
      : percentage > 70
        ? 'warning'
        : 'success';

  const handleDialogToggle = () => {
    setOpenDialog(prevState => !prevState);
  };

  const handleRenew = () => {
    if (!subscription.id) return;

    router.get(route('app.renewal.subscription', {
      tenant: currentTenantId,
      subscription: subscription.id
    }));
  };

  return (
    <ListItem key={`customer-subscription-item-${index}`}>
      <Box
        sx={{
          width: '100%',
          borderTop: index > 0 ? '1px solid #ccc' : 'none',
          paddingTop: index > 0 ? 3 : 0
        }}
      >
        <Typography
          variant="h6"
          fontSize={19}>
          {`${subscription.entity?.name} - ${subscription.price_list?.name}`}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={barColor}
        />
        <Box
          sx={{
            my: 2,
            width: '100%',
            display: 'flex',
            alignItems: 'bottom',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <IconButton onClick={handleDialogToggle}>
              <EditIcon />
            </IconButton>
            {openDialog && <EditSubscriptionDialog subscription={subscription} open={openDialog} onClose={handleDialogToggle}/>}
          </Box>
          <Box>
            <Button variant="contained" size="small" onClick={handleRenew}>
              Rinnova Ora
            </Button>
          </Box>
        </Box>
        <Typography variant="body2">
          Inizio: <FormattedDate value={subscription.start_date} />
        </Typography>
        <Typography variant="body2">
          Scadenza originale: {subscription.end_date ? <FormattedDate value={subscription.end_date} /> : 'Nessuna scadenza'}
        </Typography>
        {(subscription.suspended_days > 0 || subscription.extended_days > 0) && (
          <>
            {subscription.suspended_days > 0 && (
              <Typography variant="body2" color="warning.main">
                {`Sospeso: ${subscription.suspended_days} giorni`}
              </Typography>
            )}
            {subscription.extended_days > 0 && (
              <Typography variant="body2" color="success.main">
                {`Prorogato: ${subscription.extended_days} giorni`}
              </Typography>
            )}
            <Typography variant="body2" fontWeight={600}>
              Scadenza effettiva: {effectiveEnd ? <FormattedDate value={effectiveEnd} /> : 'Nessuna scadenza'}
            </Typography>
          </>
        )}
        {subscription.sale_row && (
          <Typography>{`Promozione: ${subscription.sale_row.sale?.promotion.description}`}</Typography>
        )}
        <Typography variant="body2">Note: {subscription.notes}</Typography>
      </Box>
    </ListItem>
  );
};

export default SubscriptionItem;
