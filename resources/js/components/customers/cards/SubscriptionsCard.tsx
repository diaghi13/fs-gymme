import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  List,
  Typography
} from '@mui/material';
import { usePage } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import SubscriptionItem from '@/components/customers/SubscriptionItem';

const SubscriptionsCard = () => {
  const { active_subscriptions: subscriptions } = usePage<CustomerShowProps>().props.customer;

  if (!subscriptions || subscriptions.length === 0) {
    return null; // Render nothing if there are no subscriptions
  }

  return (
    <Card>
      <CardHeader title={<Typography variant={'h6'}>Abbonamenti Attivi</Typography>} />
      <CardContent sx={{ p: 0 }}>
        {subscriptions.length === 0 && (
          <Typography sx={{ px: 2 }}>
            Nessun abbonamento presente
          </Typography>
        )}
        <List>
          {subscriptions.map((item, index: number) => (
            <SubscriptionItem subscription={item} index={index} key={`customer-subscription-item-${index}`} />
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default SubscriptionsCard;
