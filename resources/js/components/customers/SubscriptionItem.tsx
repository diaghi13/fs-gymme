import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  LinearProgress, LinearProgressProps,
  ListItem,
  Typography
} from '@mui/material';
import format from '@/support/format';
import { Subscription } from '@/types';

import EditIcon from '@mui/icons-material/Edit';
import EditSubscriptionDialog from '@/components/customers/dialogs/EditSubscriptionDialog';

interface SubscriptionItemProps {
  subscription: Subscription; // Replace 'any' with the actual type of your subscription item
  index: number; // Add index prop to identify the item in the list
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ subscription, index }) => {
  const [openDialog, setOpenDialog] = useState(false);

  const start: Date = new Date(subscription.start_date);
  const end: Date = new Date(subscription.end_date);
  const today: Date = new Date();
  const percentage = Math.round(
    ((today.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100
  );

  const barColor: LinearProgressProps['color'] =
    percentage > 90
      ? 'error'
      : percentage > 70
        ? 'warning'
        : 'success';

  const handleDialogToggle = () => {
    setOpenDialog(prevState => !prevState);
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
            <Button variant="contained" size="small">
              Rinnova Ora
            </Button>
          </Box>
        </Box>
        <Typography variant="body2">
          {`Inizio: ${format(new Date(subscription.start_date), 'dd/MM/yyyy')}`}
        </Typography>
        <Typography variant="body2">
          {`Fine: ${format(new Date(subscription.end_date), 'dd/MM/yyyy')}`}
        </Typography>
        {subscription.sale_row && (
          <Typography>{`Promozione: ${subscription.sale_row.sale?.promotion.description}`}</Typography>
        )}
        <Typography variant="body2">Note: {subscription.notes}</Typography>
      </Box>
    </ListItem>
  );
};

export default SubscriptionItem;
